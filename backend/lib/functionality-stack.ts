import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class FunctionalityStack extends cdk.Stack {
  public readonly secret: secretsmanager.ISecret;
  public readonly bucketName: string;
  public readonly userPoolId: string;
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

    this.userPoolId = userPool.userPoolId;

    // Create cognito client
    const userPoolClient = userPool.addClient('userPoolclient', {
      userPoolClientName: userPoolName,
      authFlows: {
        userPassword: true,
        userSrp: true,
      }
    });

    /**
     *
     * Store secrets to Secret Manager
     * User pool id, client id, and region the user pool deployed
     */
    const secretsName = "Noise_Tracker_Cognito_Secrets"; 

    this.secret = new secretsmanager.Secret(this, secretsName, {
      secretName: secretsName,
      description: "Cognito Secrets for authentication",
      secretObjectValue: {
        REACT_APP_USERPOOL_ID: cdk.SecretValue.unsafePlainText(
          userPool.userPoolId
        ),
        REACT_APP_USERPOOL_WEB_CLIENT_ID: cdk.SecretValue.unsafePlainText(
          userPoolClient.userPoolClientId
        ),
        REACT_APP_REGION: cdk.SecretValue.unsafePlainText(this.region),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    new cdk.CfnOutput(this, 'CognitoClientID', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito user pool Client ID'
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolID', {
      value: userPool.userPoolId,
      description: 'Cognito user pool ID'
    });


    // Create S3 buckets for hydrophone data
    const s3bucket = new s3.Bucket(this, "noise-tracker-bucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ["*"],
        },
      ],
    });

    this.bucketName = s3bucket.bucketName;
  }
}
