import { Stack, StackProps, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

// Service files import
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

// Stack import
import { VpcStack } from './vpc-stack';


export class DBStack extends Stack {
    public readonly dbInstance: rds.DatabaseInstance;
    public readonly secretPathAdminName: string;
    public readonly secretPathUser: secretsmanager.Secret;
    constructor(scope: Construct, id: string, vpcStack: VpcStack, props?: StackProps){
        super(scope, id, props);

        /**
         * 
         * Retrive a secrete from Secret Manager
         * aws secretsmanager create-secret --name NoiseTrackerSecrets --secret-string "{\"DB_Username\":\"DB-USERNAME\"}"  --profile <your-profile-name>
         */
        const secret = secretmanager.Secret.fromSecretNameV2(this, "ImportedSecrets", "NoiseTrackerSecrets");

        /**
         * 
         * Create Empty Secret Manager
         * Secrets will be populate at initalization of data
         */
        this.secretPathAdminName = "NoiseTracker/credentials/dbCredentials"; // Name in the Secret Manager to store DB credentials
        const secretPathUserName = "NoiseTracker/userCredentials/dbCredentials";
        this.secretPathUser = new secretsmanager.Secret(this, secretPathUserName, {
            secretName: secretPathUserName,
            description: "Secrets for clients to connect to RDS",
            removalPolicy: RemovalPolicy.DESTROY,
            secretObjectValue: {
                username: SecretValue.unsafePlainText("applicationUsername"),   // this will change later at runtime
                password: SecretValue.unsafePlainText("applicationPassword")    // in the initializer
            }
        });

        /**
         * 
         * Create an RDS with Postgres database in an isolated subnet
         */
        this.dbInstance = new rds.DatabaseInstance(this, "NoiseTracker", {
            vpc: vpcStack.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_14_5,
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE3,
                ec2.InstanceSize.MICRO
            ),
            credentials: rds.Credentials.fromUsername(secret.secretValueFromJson("DB_Username").unsafeUnwrap(), {
                secretName: this.secretPathAdminName,
            }),
            multiAz: true,
            allocatedStorage: 100,
            maxAllocatedStorage: 115,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(7),
            deleteAutomatedBackups: true,
            deletionProtection: true,/// To be chanaged
            databaseName: "noiseTracker",
            publiclyAccessible: false,
            cloudwatchLogsRetention: logs.RetentionDays.INFINITE,
            storageEncrypted: true, // storage encryption at rest
            monitoringInterval: Duration.seconds(60), // enhanced monitoring interval
        });

        this.dbInstance.connections.securityGroups.forEach(function (securityGroup) {
            // 10.0.0.0/16 match the cidr range in vpc stack
            securityGroup.addIngressRule(
              ec2.Peer.ipv4("10.0.0.0/16"),
              ec2.Port.tcp(5432),
              "Postgres Ingress"
            );
        });
    }
}