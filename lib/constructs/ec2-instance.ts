import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as fs from "fs";
import * as path from "path";

export interface Ec2InstanceProps {
  vpc: cdk.aws_ec2.IVpc;
}

export class Ec2Instance extends Construct {
  readonly instance: cdk.aws_ec2.Instance;

  constructor(scope: Construct, id: string, props: Ec2InstanceProps) {
    super(scope, id);

    // User data
    const userDataScript = fs.readFileSync(
      path.join(__dirname, "../ec2/user-data.sh"),
      "utf8"
    );
    const userData = cdk.aws_ec2.UserData.forLinux({
      shebang: "#!/bin/bash",
    });
    userData.addCommands(userDataScript);

    // EC2 Instance
    this.instance = new cdk.aws_ec2.Instance(this, "Default", {
      machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2023({
        cachedInContext: true,
      }),
      instanceType: new cdk.aws_ec2.InstanceType("t3.micro"),
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets({
        subnetGroupName: "Public",
      }),
      propagateTagsToVolumeOnCreation: true,
      ssmSessionPermissions: true,
      userData,
      requireImdsv2: true,
    });
  }
}
