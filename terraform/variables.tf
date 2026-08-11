variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "mess-ordering-system"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "production"
}

variable "cluster_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.33"
}

variable "node_instance_type" {
  description = "EKS worker node instance type"
  type        = string
  default     = "c7i-flex.large"
}

variable "desired_nodes" {
  description = "Desired worker nodes"
  type        = number
  default     = 1
}

variable "min_nodes" {
  description = "Minimum worker nodes"
  type        = number
  default     = 1
}

variable "max_nodes" {
  description = "Maximum worker nodes"
  type        = number
  default     = 2
}

variable "root_volume_size" {
  description = "Worker node root EBS volume in GB"
  type        = number
  default     = 30
}
