locals {
  fqdn           = var.environment == "prod01" ? var.project : "${var.project}-${var.environment}.${var.zone}"
  db_credentials = jsondecode(data.aws_secretsmanager_secret_version.postgres_creds.secret_string)
}
