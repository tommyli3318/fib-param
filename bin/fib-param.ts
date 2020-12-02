#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { FibStack } from "../app-def/fib-stack";

const app = new App();
var namespace = app.node.tryGetContext('stack-namespace');

new FibStack(app, `${namespace}-stack`);

// app.synth();