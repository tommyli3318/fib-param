#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { FibStack } from "../app-def/fib-stack";

const app = new App();
new FibStack(app, "stack");