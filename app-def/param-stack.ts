import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { ParamUtil } from "./param-util"

enum DeployEnvEnum {
    dev,
    rc,
    prod
}

export abstract class ParametersStack extends Stack {

    protected Parameters: ParamUtil;
    protected nameSpace: string;
    protected DeployEnv: DeployEnvEnum;

    protected abstract construct(): void;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        this.Parameters = new ParamUtil(scope, id, props);
        this.nameSpace = this.node.tryGetContext('stack-namespace');
        this.DeployEnv = this.node.tryGetContext('deployment-env');
        this.construct();
    }

    protected generateName(input: string): string {
        return `${this.nameSpace}-${input}`;
    }
}