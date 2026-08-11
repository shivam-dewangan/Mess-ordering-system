module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.24.0"

  name               = "${var.project_name}-eks"
  kubernetes_version = var.cluster_version

  endpoint_public_access  = true
  endpoint_private_access = true

  enable_irsa = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }

    kube-proxy = {
      most_recent = true
    }

    vpc-cni = {
      most_recent = true
    }

    eks-pod-identity-agent = {
      most_recent = true
    }
  }

  eks_managed_node_groups = {
    main = {
      name = "${var.project_name}-nodes"

      instance_types = [
        var.node_instance_type
      ]

      capacity_type = "ON_DEMAND"

      min_size     = var.min_nodes
      max_size     = var.max_nodes
      desired_size = var.desired_nodes

      disk_size = var.root_volume_size

      disk_type = "gp3"

      ami_type = "AL2023_x86_64_STANDARD"

      labels = {
        role = "main"
      }

      update_config = {
        max_unavailable_percentage = 50
      }

      enable_bootstrap_user_data = true
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
