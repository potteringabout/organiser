data "aws_caller_identity" "current" {}

data "aws_vpc" "vpc" {
  tags = {
    Name = "${var.project}-${var.account}-vpc"
  }
}

data "aws_subnets" "app_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name   = "tag:Name"
    values = ["${var.project}-${var.account}-app-*"]
  }
}

data "aws_subnets" "data_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name   = "tag:Name"
    values = ["${var.project}-${var.account}-data-*"]
  }
}