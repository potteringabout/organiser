terraform {
  backend "s3" {}
  required_version = "~> 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.95"
      #configuration_aliases = [aws.deployment]
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  assume_role {
    role_arn = var.deployment_role_arn
  }

  default_tags {
    tags = {
      account          = var.account
      account_full     = var.account_full
      deployment_mode  = var.deployment_mode
      deployment_repo  = var.deployment_repo
      email            = var.email
      environment      = var.environment
      environment_full = var.environment_full
      owner            = var.owner
      project          = var.project
      project_full     = var.project_full
    }
  }
}

provider "aws" {
  region = var.aws_region

  assume_role {
    role_arn = var.deployment_role_arn
  }

  default_tags {
    tags = {
      account          = var.account
      account_full     = var.account_full
      deployment_mode  = var.deployment_mode
      deployment_repo  = var.deployment_repo
      email            = var.email
      environment      = var.environment
      environment_full = var.environment_full
      owner            = var.owner
      project          = var.project
      project_full     = var.project_full
    }
  }
}

provider "aws" {
  alias  = "dns"
  region = var.aws_region

  assume_role {
    role_arn = var.dns_role_arn
  }

  default_tags {
    tags = {
      account          = var.account
      account_full     = var.account_full
      deployment_mode  = var.deployment_mode
      deployment_repo  = var.deployment_repo
      email            = var.email
      environment      = var.environment
      environment_full = var.environment_full
      owner            = var.owner
      project          = var.project
      project_full     = var.project_full
    }
  }
}