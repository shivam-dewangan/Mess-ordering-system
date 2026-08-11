aws_region       = "ap-south-1"
project_name     = "mess-ordering-system"
environment      = "production"

cluster_version  = "1.33"

node_instance_type = "c7i-flex.large"

desired_nodes = 1
min_nodes     = 1
max_nodes     = 2

root_volume_size = 30
