import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class FunctionalityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create cognito user pool
    const userPoolName = "noiseTrackerUserPool";

    const userPool = new cognito.UserPool(this, 'noisetracker-userpool', {
      userPoolName: userPoolName,
      signInCaseSensitive: false,
      selfSignUpEnabled: false,
      mfa: cognito.Mfa.OFF,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      accountRecovery: cognito.AccountRecovery.NONE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create cognito client
    const userPoolClient = userPool.addClient('userPoolclient', {
      userPoolClientName: userPoolName,
      authFlows: {
        userPassword: true,
        userSrp: true,
      }
    });

    new cdk.CfnOutput(this, 'CognitoClientID', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito user pool Client ID'
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolID', {
      value: userPool.userPoolId,
      description: 'Cognito user pool ID'
    });
  }
}
