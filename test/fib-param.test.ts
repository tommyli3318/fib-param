import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as FibParam from '../app-def/fib-param-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FibParam.FibParamStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
