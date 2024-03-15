import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { NatProvider } from "aws-cdk-lib/aws-ec2";

export class VpcStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly openSearchVPCPermissions: iam.CfnServiceLinkedRole;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const natGatewayProvider = ec2.NatProvider.gateway();

    // VPC for application
    this.vpc = new ec2.Vpc(this, "noiseTracker-Vpc", {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGatewayProvider: natGatewayProvider,
      natGateways: 1,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
            name: "isolated-subnet",
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
      },
    });

    this.vpc.addFlowLog("noiseTracker-vpcFlowLog");

    // Get default security group for VPC
    const defaultSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      id,
      this.vpc.vpcDefaultSecurityGroup
    );

    // Add secrets manager endpoint to VPC
    this.vpc.addInterfaceEndpoint("Secrets Manager Endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // Add RDS endpoint to VPC
    this.vpc.addInterfaceEndpoint("RDS Endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.RDS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });
  }
}