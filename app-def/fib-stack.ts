import { CfnOutput, Construct, StackProps, Duration } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html
import * as sfn from "@aws-cdk/aws-stepfunctions"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-readme.html
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-tasks-readme.html
import { Rule, Schedule } from "@aws-cdk/aws-events"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-events-readme.html
import { SfnStateMachine } from "@aws-cdk/aws-events-targets"; // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-events-targets.SfnStateMachine.html
import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as s3 from "@aws-cdk/aws-s3";
import { ParametersStack } from "./param-stack"

export class FibStack extends ParametersStack {
  // URL of API Gateway endpoint
  public urlOutput: CfnOutput;
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    // id = this.generateName(id); // error: 'super' must be called before accessing 'this'
    super(scope, id, props);
    //id = this.generateName(id);
    // TODO: stack ID rename not working, above code only changes local variable id
    // this.node.id = this.generateName(id); // error: this.node.id is read-only
  }

  protected construct() {
    const env = {
      DYNAMODB_TABLE: this.Parameters.getParameter("DYNAMODB_TABLE"),
      S3_BUCKET: this.Parameters.getParameter("S3_BUCKET"),
      NAMES_FILE: this.Parameters.getParameter("S3_BUCKET_FILENAME")
    }
    
    // define lambdas
    const lambdaA = new lambda.Function(this, this.generateName("lambdaA"), {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-a.lambda_handler", // file is "gsa-lambda-a", function is "lambda_handler"
      environment: env
    });

    const lambdaB = new lambda.Function(this, this.generateName("lambdaB"), {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-b.lambda_handler",
      environment: env
    });

    const lambdaC = new lambda.Function(this, this.generateName("lambdaC"), {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-c.lambda_handler",
      environment: env
    });

    const lambdaD = new lambda.Function(this, this.generateName("lambdaD"), {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-d.lambda_handler",
      environment: env
    });

    // define step function tasks
    const taskLambdaA = new tasks.LambdaInvoke(this, this.generateName("task-invokeA"), {
      lambdaFunction: lambdaA,
      comment: "Returns last sequence value from S3",
      resultPath: "$.outputA",
    });
    const taskLambdaB = new tasks.LambdaInvoke(this, this.generateName("task-invokeB"), {
      lambdaFunction: lambdaB,
      comment:
        "Returns last sequence value with last two inserted fibonacci values",
      inputPath: "$.outputA",
      resultPath: "$.outputB",
    });
    const taskLambdaC = new tasks.LambdaInvoke(this, this.generateName("task-invokeC"), {
      lambdaFunction: lambdaC,
      comment: "Sum of two values",
      inputPath: "$.outputB",
    });

    // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-stepfunctions.Chain.html
    const stepChain = taskLambdaA.next(taskLambdaB).next(taskLambdaC);

    // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-stepfunctions.StateMachine.html
    const stateMachine = new sfn.StateMachine(this, this.generateName("stateMachine"), {
      definition: stepChain,
      stateMachineName: `Run-Lambdas-${this.node.uniqueId}`,
    });

    // setting up existing table
    const fibTable = dynamodb.Table.fromTableName(
      this,
      this.generateName("fibTable"),
      env.DYNAMODB_TABLE
    );
    
    // granting lambdas read/write permissions
    fibTable.grantReadWriteData(lambdaA);
    fibTable.grantReadWriteData(lambdaB);
    fibTable.grantReadWriteData(lambdaC);
    fibTable.grantReadWriteData(lambdaD);
    
    // setting up existing S3 bucket
    const namesBucket = s3.Bucket.fromBucketName(
      this,
      this.generateName("names-bucket"),
      env.S3_BUCKET
    );
    // granting read access to lambda A
    namesBucket.grantRead(lambdaA);

    // aws-event rule, tell step function to run once a day
    new Rule(this, this.generateName("ScheduleRule"), {
      schedule: Schedule.rate(Duration.days(1)),
      targets: [new SfnStateMachine(stateMachine)],
    });

    // setting up new rest API with lambda integration with POST method
    const fibApi = new apigw.RestApi(this, this.generateName("API"), {
      restApiName: "Fibonacci Service",
    });
    
    const getFibInteractions = new apigw.LambdaIntegration(lambdaD);
    fibApi.root.addMethod("POST", getFibInteractions);

    this.urlOutput = new CfnOutput(this, this.generateName("Url"), {
      value: fibApi.url,
    });
  }
}
