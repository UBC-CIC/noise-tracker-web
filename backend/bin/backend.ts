#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FunctionalityStack } from '../lib/functionality-stack';
import { VpcStack } from '../lib/vpc-stack';
import { DBStack } from '../lib/database-stack';
import { DBFlowStack } from '../lib/dbFlow-stack';

const app = new cdk.App();

const stackDefaultSetup = {
  env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
  }
};

// Create instance of a VPC stack
const vpcStack = new VpcStack(app, 'VpcStack', stackDefaultSetup);

// Create an instance of functionality stack
const functionalityStack = new FunctionalityStack(app, 'FunctionalityStack', stackDefaultSetup);

// Create instance of a Database stack
const dbStack = new DBStack(app, 'DBStack', vpcStack, stackDefaultSetup);

// Create instance of a Database Flow stack
const dbFlowStack = new DBFlowStack(app, 'DBFlowStack', vpcStack, dbStack, stackDefaultSetup);