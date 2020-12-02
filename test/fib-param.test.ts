import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as fs from '../app-def/fib-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new fs.FibStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
