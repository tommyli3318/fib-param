import { Construct, Stack, StackProps } from "@aws-cdk/core";
import * as ssm from '@aws-cdk/aws-ssm';

export class ParamUtil extends Stack {
    private nameSpace: string;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        // this.nameSpace = this.node.tryGetContext('param-namespace');
    }

    public getParameter(paramName: string): string {
        // looks for parameters in the Parameter Store with the form: [namespace]-[parameter name]
        return ssm.StringParameter.fromStringParameterAttributes(this, `${this.nameSpace}-${paramName}-value`, {
            parameterName: `${this.nameSpace}-${paramName}`
        }).stringValue;
    }
}