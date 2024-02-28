import {Stack, StackProps, triggers } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

// Service files import
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

// Stack import
import { VpcStack } from './vpc-stack';
import {DBStack} from './database-stack';
import { FunctionalityStack } from './functionality-stack';

export class APIStack extends Stack {
    constructor(scope: Construct, id: string, vpcStack: VpcStack, db: DBStack, props?: StackProps){
        super(scope, id, props);
        /*
         * Create an IAM role for lambda function to get access to database
         */
        //Create a role for lambda to access the postgresql database
        const lambdaRole = new iam.Role(this, "postgresLambdaRole", {
            roleName: "postgresLambdaRole",
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        });

        // Grant access to Secret Manager
        lambdaRole.addToPolicy(
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

        // Grant access to EC2
        lambdaRole.addToPolicy(
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
        lambdaRole.addToPolicy(
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

        /* 
         * Create Integration Lambda layer for PSQL
         */ 
        const postgres = new lambda.LayerVersion(this, 'postgres', {
            code: lambda.Code.fromAsset('./lambda/layers/postgres.zip'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            description: 'Contains the postgres library for JS',
        }); 

        // Create a handler for the api
        const apiHandler = new lambda.Function(this, "apiHandler", {
            functionName: "apiHandler",
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "apiHandler.handler",
            timeout: Duration.seconds(300),
            memorySize: 512,
            environment:{
                SM_DB_CREDENTIALS: db.secretPathUser.secretName,     
            },
            vpc: vpcStack.vpc,
            code: lambda.Code.fromAsset("lambda"),
            layers: [postgres],
            role: lambdaRole,
        });

        // Create API Gateway
        const api = new apigateway.RestApi(this, 'api', {
            deployOptions: {
              loggingLevel: apigateway.MethodLoggingLevel.INFO,
              dataTraceEnabled: true,
            },
            defaultCorsPreflightOptions: {
              allowOrigins: apigateway.Cors.ALL_ORIGINS,
              allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
            },
            cloudWatchRole: true,
            endpointConfiguration: {
              types: [ apigateway.EndpointType.REGIONAL ]
            },
          });
      
          // define api resources
          const hydrophonesResource = api.root.addResource('hydrophones');
          const hydrophonesPublicResource = hydrophonesResource.addResource('public');
          const operatorsResource = api.root.addResource('operators');
          const metricsResource = api.root.addResource('metrics');
      
          hydrophonesResource.addMethod('GET', new apigateway.LambdaIntegration(apiHandler, {proxy: true}));
          hydrophonesResource.addMethod('POST', new apigateway.LambdaIntegration(apiHandler, {proxy: true}));
          hydrophonesResource.addMethod('PUT', new apigateway.LambdaIntegration(apiHandler, {proxy: true}));

          operatorsResource.addMethod('GET', new apigateway.LambdaIntegration(apiHandler, {proxy: true}));
          operatorsResource.addMethod('POST', new apigateway.LambdaIntegration(apiHandler, {proxy: true}));
          operatorsResource.addMethod('PUT', new apigateway.LambdaIntegration(apiHandler, {proxy: true}));
    }
}