locals {
  fqdn = var.environment == "prod01" ? var.project : "${var.project}-${var.environment}.${var.zone}"
}