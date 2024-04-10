import {Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

// Service files import
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

// Stack import
import { VpcStack } from './vpc-stack';
import { DBStack } from './database-stack';
import { FunctionalityStack } from './functionality-stack';

export class APIStack extends Stack {
    constructor(scope: Construct, id: string, vpcStack: VpcStack, db: DBStack, functionalityStack: FunctionalityStack, props?: StackProps){
        super(scope, id, props);
        /*
         * Create an IAM role for lambda function to get access to database
         */
        //Create a role for lambda to access the postgresql database
        const lambdaRole = new iam.Role(this, "lambdaRole", {
            roleName: "lambdaRole",
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

        // Grant access to s3
        lambdaRole.addToPolicy(
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

      // Grant access to cognito
      lambdaRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cognito-idp:AdminCreateUser",
            "cognito-idp:AdminDeleteUser",
            "cognito-idp:AdminAddUserToGroup"
          ],
          resources: [
            `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${functionalityStack.userPoolId}`
          ],
        })
    );

        /**
         *
         * Create layers
         */

        // Create Integration Lambda layer for PSQL
        const postgres = new lambda.LayerVersion(this, 'postgres', {
            code: lambda.Code.fromAsset('./lambda/layers/postgres.zip'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            description: 'Contains the postgres library for JS',
        }); 

        // Create Integration Lambda layer for aws-jwt-verify
        const jwt = new lambda.LayerVersion(this, "aws-jwt-verify", {
          code: lambda.Code.fromAsset("./lambda/layers/aws-jwt-verify.zip"),
          compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
          description: "Contains the aws-jwt-verify library for JS",
        });

        // Create Integration Lambda layer for jwt-decode
        const jwtDecode = new lambda.LayerVersion(this, "jwt-decode", {
          code: lambda.Code.fromAsset("./lambda/layers/jwt-decode.zip"),
          compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
          description: "Contains the jwt-decode library for JS",
        });

        const pyJWT = new lambda.LayerVersion(this, "pyjwt", {
          code: lambda.Code.fromAsset("./lambda/layers/pyjwt.zip"),
          compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
          description: "Contains the PyJWT library",
        });

        const psyscopg2 = new lambda.LayerVersion(this, "psyscopg2", {
          code: lambda.Code.fromAsset("./lambda/layers/psycopg2.zip"),
          compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
          description: "psycopg2 library for connecting to the PostgreSQL database",
        });


        // Create an admin handler for the api
        const apiAdminHandler = new lambda.Function(this, "apiAdminHandler", {
            functionName: "apiAdminHandler",
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "apiAdminHandler.handler",
            timeout: Duration.seconds(300),
            memorySize: 512,
            environment:{
                SM_DB_CREDENTIALS: db.secretPathUser.secretName, 
                SM_COGNITO_CREDENTIALS: functionalityStack.secret.secretName, 
                BUCKET_NAME: functionalityStack.bucketName,   
            },
            vpc: vpcStack.vpc,
            code: lambda.Code.fromAsset("lambda"),
            layers: [postgres],
            role: lambdaRole,
        });

        // Create an operator handler for the api
        const apiOperatorHandler = new lambda.Function(this, "apiOperatorHandler", {
          functionName: "apiOperatorHandler",
          runtime: lambda.Runtime.NODEJS_16_X,
          handler: "apiOperatorHandler.handler",
          timeout: Duration.seconds(300),
          memorySize: 512,
          environment:{
              SM_DB_CREDENTIALS: db.secretPathUser.secretName, 
          },
          vpc: vpcStack.vpc,
          code: lambda.Code.fromAsset("lambda"),
          layers: [postgres, jwtDecode],
          role: lambdaRole,
        });

         // Create a public request handler for the api
         const apiPublicHandler = new lambda.Function(this, "apiPublicHandler", {
          functionName: "apiPublicHandler",
          runtime: lambda.Runtime.NODEJS_16_X,
          handler: "apiPublicHandler.handler",
          timeout: Duration.seconds(300),
          memorySize: 512,
          environment:{
              SM_DB_CREDENTIALS: db.secretPathUser.secretName,
              BUCKET_NAME: functionalityStack.bucketName, 
          },
          vpc: vpcStack.vpc,
          code: lambda.Code.fromAsset("lambda"),
          layers: [postgres],
          role: lambdaRole,
        });

        // Create a lambda to handle requests to download metric data from s3
        const operatorDownloadHandler = new lambda.Function(this, "noiseTracker-operatorDownloadHandler", {
          functionName: "noiseTracker-operatorDownloadHandler",
          runtime: lambda.Runtime.PYTHON_3_9,
          handler: "operatorDownloadHandler.handler",
          timeout: Duration.seconds(300),
          memorySize: 512,
          environment:{
            SM_DB_CREDENTIALS: db.secretPathUser.secretName,
            BUCKET_NAME: functionalityStack.bucketName,   
          },
          vpc: vpcStack.vpc,
          code: lambda.Code.fromAsset("lambda"),
          layers: [pyJWT, psyscopg2],
          role: lambdaRole,
        });

        /**
         *
         * Create Lambda for Admin Authorization endpoints
         */
        const adminAuthorizerFunction = new lambda.Function(
          this,
          "admin-authorization-api-gateway",
          {
            runtime: lambda.Runtime.NODEJS_16_X, // Execution environment
            code: lambda.Code.fromAsset("lambda"), // Code loaded from "lambda" directory
            handler: "adminAuthorizerFunction.handler", // Code handler
            timeout: Duration.seconds(300),
            vpc: vpcStack.vpc,
            environment: {
              SM_COGNITO_CREDENTIALS: functionalityStack.secret.secretName,
            },
            functionName: "adminLambdaAuthorizer",
            memorySize: 512,
            layers: [jwt],
            role: lambdaRole,
          }
        );

        // Add the permission to the Lambda function's policy to allow API Gateway access
        adminAuthorizerFunction.grantInvoke(
          new iam.ServicePrincipal("apigateway.amazonaws.com")
        );

        /**
         *
         * Create Lambda for Operator Authorization endpoints
         */
        const operatorAuthorizerFunction = new lambda.Function(
          this,
          "operator-authorization-api-gateway",
          {
            runtime: lambda.Runtime.NODEJS_16_X, // Execution environment
            code: lambda.Code.fromAsset("lambda"), // Code loaded from "lambda" directory
            handler: "operatorAuthorizerFunction.handler", // Code handler
            timeout: Duration.seconds(300),
            vpc: vpcStack.vpc,
            environment: {
              SM_COGNITO_CREDENTIALS: functionalityStack.secret.secretName,
            },
            functionName: "operatorLambdaAuthorizer",
            memorySize: 512,
            layers: [jwt],
            role: lambdaRole,
          }
        );

        // Add the permission to the Lambda function's policy to allow API Gateway access
        operatorAuthorizerFunction.grantInvoke(
          new iam.ServicePrincipal("apigateway.amazonaws.com")
        );

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

        const adminAuthorizer = new apigateway.TokenAuthorizer(this, 'adminAuthorizer', {handler: adminAuthorizerFunction});
        const operatorAuthorizer = new apigateway.TokenAuthorizer(this, 'operatorAuthorizer', {handler: operatorAuthorizerFunction});
      
          // define api resources
          const adminResource = api.root.addResource('admin');
          const adminHydrophones = adminResource.addResource('hydrophones')
          const adminOperators = adminResource.addResource('operators')

          const operatorResource = api.root.addResource('operator');
          const operatorDownload = operatorResource.addResource('download')
          const operatorHydrophones = operatorResource.addResource('hydrophones')
          const operatorOperators = operatorResource.addResource('operators')

          const publicResource = api.root.addResource('public');
          const publicHydrophones = publicResource.addResource('hydrophones')
          const publicSpectrograms = publicResource.addResource('spectrograms')

          adminHydrophones.addMethod('GET', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}), {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });
          adminHydrophones.addMethod('POST', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });
          adminHydrophones.addMethod('PUT', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });
          adminHydrophones.addMethod('DELETE', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });

          adminOperators.addMethod('GET', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });
          adminOperators.addMethod('POST', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });
          adminOperators.addMethod('PUT', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });
          adminOperators.addMethod('DELETE', new apigateway.LambdaIntegration(apiAdminHandler, {proxy: true}),
          {
            authorizer: adminAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });

          operatorDownload.addMethod('GET', new apigateway.LambdaIntegration(operatorDownloadHandler, {proxy: true}),
          {
            authorizer: operatorAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });

          operatorHydrophones.addMethod('GET', new apigateway.LambdaIntegration(apiOperatorHandler, {proxy: true}),
          {
            authorizer: operatorAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });

          operatorOperators.addMethod('GET', new apigateway.LambdaIntegration(apiOperatorHandler, {proxy: true}),
          {
            authorizer: operatorAuthorizer,
            authorizationType: apigateway.AuthorizationType.CUSTOM,
          });

          publicHydrophones.addMethod('GET', new apigateway.LambdaIntegration(apiPublicHandler, {proxy: true}));
          publicSpectrograms.addMethod('GET', new apigateway.LambdaIntegration(apiPublicHandler, {proxy: true}));

    }
}