import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface AlbProps {
  vpc: cdk.aws_ec2.IVpc;
  instance: cdk.aws_ec2.Instance;
}

export class Alb extends Construct {
  readonly instance: cdk.aws_ec2.IInstance;

  constructor(scope: Construct, id: string, props: AlbProps) {
    super(scope, id);

    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      "Alb",
      {
        vpc: props.vpc,
        internetFacing: true,
        vpcSubnets: {
          subnets: props.vpc.publicSubnets,
        },
      }
    );
    props.instance.connections.allowFrom(alb, cdk.aws_ec2.Port.tcp(80));

    const target = new cdk.aws_elasticloadbalancingv2_targets.InstanceTarget(
      props.instance,
      80
    );

    const targetGroup =
      new cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup(
        this,
        "TargetGroup",
        {
          vpc: props.vpc,
          port: 80,
          targetType: cdk.aws_elasticloadbalancingv2.TargetType.INSTANCE,
          targets: [target],
        }
      );

    const listener = alb.addListener("Listener", {
      port: 80,
      protocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    const ipAddresses = [];
    for (let i = 0; i < 5; i++) {
      ipAddresses.push(`10.0.1.${i}/32`);
    }

    for (let i = 0; i < 20; i++) {
      listener.addTargets(`Targets${i}`, {
        priority: i + 2,
        conditions: [
          cdk.aws_elasticloadbalancingv2.ListenerCondition.sourceIps(
            ipAddresses
          ),
        ],
        targets: [target],
        port: 80,
      });
    }
  }
}
