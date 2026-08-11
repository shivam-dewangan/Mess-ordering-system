module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.24.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  endpoint_public_access  = true
  endpoint_private_access = true

  authentication_mode = "API"

  enable_cluster_creator_admin_permissions = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # ==========================================================
  # EKS AUTO MODE
  # ==========================================================

  compute_config = {
    enabled    = true
    node_pools = ["system", "general-purpose"]
  }

  # ==========================================================
  # EKS AUTO MODE NETWORK LOAD BALANCING
  # ==========================================================

  kubernetes_network_config = {
    elastic_load_balancing = {
      enabled = true
    }
  }

  # ==========================================================
  # EKS AUTO MODE EBS STORAGE
  # ==========================================================

  storage_config = {
    block_storage = {
      enabled = true
    }
  }

  # ==========================================================
  # CLUSTER LOGGING
  # ==========================================================

  enabled_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  tags = {
    Name = var.cluster_name
  }
}
