data "aws_caller_identity" "current" {}

data "aws_vpc" "vpc" {
  tags = {
    Name = "${var.owner}-${var.account}-vpc"
  }
}

data "aws_subnets" "app_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name   = "tag:Name"
    values = ["${var.owner}-${var.account}-app-*"]
  }
}

locals {
  access_or_public_subnets = concat(
    data.aws_subnets.access_subnets.ids,
    data.aws_subnets.pub_subnets.ids
  )
}

data "aws_subnets" "data_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name   = "tag:Name"
    values = ["${var.owner}-${var.account}-data-*"]
  }
}

data "aws_subnets" "pub_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name   = "tag:Name"
    values = ["${var.owner}-${var.account}-pub*"]
  }
}

data "aws_subnets" "access_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name   = "tag:Name"
    values = ["${var.owner}-${var.account}-access*"]
  }
}