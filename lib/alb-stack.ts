import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc } from "./constructs/vpc";
import { Ec2Instance } from "./constructs/ec2-instance";
import { Alb } from "./constructs/alb";

export class AlbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpc(this, "Vpc");

    // EC2 Instance
    const instance = new Ec2Instance(this, "Ec2Instance", {
      vpc: vpc.vpc,
    });

    new Alb(this, "Alb", {
      vpc: vpc.vpc,
      instance: instance.instance,
    });
  }
}
