import {Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

// Service files import
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

// Stack import
import { VpcStack } from './vpc-stack';
import { DBStack } from './database-stack';
import { FunctionalityStack } from './functionality-stack';

export class DataWorkflowStack extends Stack {
    constructor(scope: Construct, id: string, vpcStack: VpcStack, db: DBStack, functionalityStack: FunctionalityStack, props?: StackProps){
        super(scope, id, props);
        /*
         * Create an IAM role for lambda function
         */
        const calculateAverageSplLambdaRole = new iam.Role(this, "calculateAverageSplLambdaRole", {
            roleName: "calculateAverageSplLambdaRole",
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        });

        // Grant access to EC2
        calculateAverageSplLambdaRole.addToPolicy(
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "ec2:CreateNetworkInterface",
              "ec2:DescribeNetworkInterfaces",
              "ec2:DeleteNetworkInterface",
              "ec2:AssignPrivateIpAddresses",
              "ec2:UnassignPrivateIpAddresses",
            ],
            resources: ["*"], // must be *
          })
        );

        // Grant access to log
        calculateAverageSplLambdaRole.addToPolicy(
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                //Logs
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              resources: ["arn:aws:logs:*:*:*"],
            })
        );

        // Grant access to Secret Manager
        calculateAverageSplLambdaRole.addToPolicy(
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                //Secrets Manager
                "secretsmanager:GetSecretValue",
              ],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:*`,
              ],
            })
        );

        // Grant access to s3
        calculateAverageSplLambdaRole.addToPolicy(
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "s3:PutObject",
              "s3:DeleteObject",
              "s3:ListBucket",
              "s3:GetObject",
            ],
            resources: [
              `arn:aws:s3:::${functionalityStack.bucketName}`,
              `arn:aws:s3:::${functionalityStack.bucketName}/*`
            ],
          })
        );

        // Create Integration Lambda layer for PSQL
        const postgres = new lambda.LayerVersion(this, 'postgres', {
            code: lambda.Code.fromAsset('./lambda/layers/postgres.zip'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            description: 'Contains the postgres library for JS',
        }); 
        

        // Create a Lambda function to periodically calculate average spl values 
        const calculateAverageSpl = new lambda.Function(this, "calculateAverageSpl", {
            functionName: "calculateAverageSpl",
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "calculateAverageSpl.handler",
            timeout: Duration.seconds(300),
            memorySize: 512,
            environment:{
                SM_DB_CREDENTIALS: db.secretPathUser.secretName,
                BUCKET_NAME: functionalityStack.bucketName, 
            },
            vpc: vpcStack.vpc,
            code: lambda.Code.fromAsset("lambda"),
            layers: [postgres],
            role: calculateAverageSplLambdaRole,
        });

        // Create a rule to schedule the Lambda function
        const rule = new events.Rule(this, 'scheduleCalculateAverageSplRule', {
            schedule: events.Schedule.rate(Duration.hours(24)),
        });
    
        // Add the Lambda function as a target to the rule
        rule.addTarget(new targets.LambdaFunction(calculateAverageSpl));
    }
}