
variable "deployment_role_arn" {
  description = "The ARN of role to be assumed for deployment tasks"
  default     = ""
  type        = string
}

variable "dns_role_arn" {
  description = "The ARN of role to be assumed for DNS updates"
  default     = ""
  type        = string
}


variable "aws_region" {
  default = "eu-west-2"
  type    = string
}

// Tags - https://allwynuk.atlassian.net/wiki/spaces/DevOps/pages/135758056/Tagging
variable "account" {
  description = "Account name abbreviation"
  default     = "prod"
  type        = string
}

variable "account_full" {
  description = "Account name"
  default     = "Production Account"
  type        = string
}

variable "deployment_mode" {
  description = "How the resource was deployed"
  default     = "auto"
  type        = string
}

variable "deployment_repo" {
  description = "The URL of the deployment repo"
  type        = string
}

variable "email" {
  description = "Email contact for the asset owner"
  default     = "platformengineering@allwyn.co.uk"
  type        = string
}

variable "environment" {
  description = "Environment name abbreviation in lower case"
  default     = "prod"
  type        = string
}

variable "environment_full" {
  description = "The environment name in full"
  default     = "Production environment for shared services"
  type        = string
}

variable "owner" {
  description = "The individual or team owner of the asset"
  default     = "potteringabout"
  type        = string
}

variable "project" {
  description = "Project abbreviation in lower case"
  default     = "ss"
  type        = string
}

variable "project_full" {
  description = "The project name in full"
  default     = "Shared Services"
  type        = string
}

variable "zone" {
  type = string
}

variable "create_ec2_instance" {
  description = "Flag to create the EC2 instance"
  type        = bool
  default     = false
}