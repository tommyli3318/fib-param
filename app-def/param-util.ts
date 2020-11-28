import { Construct, Stack, StackProps } from "@aws-cdk/core";
import * as ssm from '@aws-cdk/aws-ssm';

export class ParamUtil extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
    }

    getParameter(paramName: string) {
        // looks for parameters in the Parameter Store with the form: [namespace]-[parameter name]
        const namespace = this.node.tryGetContext('param-namespace');

        const stringValue = ssm.StringParameter.fromStringParameterAttributes(this, 'ParamValue', {
            parameterName: `${namespace}-${paramName}`
        }).stringValue;

        return stringValue;
    }
}