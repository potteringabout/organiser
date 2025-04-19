resource "random_password" "aurora_password" {
  length  = 20
  special = true
}

resource "aws_secretsmanager_secret" "aurora_creds" {
  name = "${var.project}-${var.environment}-aurora-creds"
}

resource "aws_secretsmanager_secret_version" "aurora_creds_version" {
  secret_id = aws_secretsmanager_secret.aurora_creds.id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.aurora_password.result
  })
}

data "aws_secretsmanager_secret_version" "aurora_creds" {
  secret_id = aws_secretsmanager_secret.aurora_creds.id
}

locals {
  db_credentials = jsondecode(data.aws_secretsmanager_secret_version.aurora_creds.secret_string)
}


# -----------------------------
# Aurora Serverless v1 Cluster
# -----------------------------
resource "aws_rds_cluster" "aurora" {
  cluster_identifier = "${var.project}-${var.environment}-aurora"
  engine             = "aurora-postgresql"
  engine_mode        = "serverless" # Serverless v1
  engine_version     = "11.9"       # Max supported version for Aurora Serverless v1

  master_username = local.db_credentials.username
  master_password = local.db_credentials.password

  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  backup_retention_period = 1
  skip_final_snapshot     = true

  scaling_configuration {
    auto_pause               = true
    min_capacity             = 0
    max_capacity             = 4
    seconds_until_auto_pause = 300
  }

  tags = {
    Name = "${var.project}-${var.environment}-aurora-v1"
  }
}

# No instance block required for Serverless v1


# --------------------------
# Subnet Group & SG
# --------------------------
resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project}-${var.environment}-aurora-subnet-group"
  subnet_ids = toset(data.aws_subnets.data_subnets.ids)

  tags = {
    Name = "${var.project}-${var.environment}-aurora-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.project}-${var.environment}-rds-security-group"
  vpc_id = data.aws_vpc.vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    description     = "Allow inbound PostgreSQL access"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# -----------------------------
# MIGRATION: Aurora Serverless v2 (Commented Out)
# -----------------------------
# resource "aws_rds_cluster" "aurora" {
#   cluster_identifier      = "${var.project}-${var.environment}-aurora"
#   engine                  = "aurora-postgresql"
#   engine_mode             = "provisioned"
#   engine_version          = "15.4"
#   master_username         = var.db_username
#   master_password         = var.db_password
#   db_subnet_group_name    = aws_db_subnet_group.aurora.name
#   vpc_security_group_ids  = [aws_security_group.rds.id]
#   backup_retention_period = 1
#   skip_final_snapshot     = true
#
#   serverlessv2_scaling_configuration {
#     min_capacity = 0.5
#     max_capacity = 2.0
#   }
#
#   tags = {
#     Name = "${var.project}-${var.environment}-aurora-v2"
#   }
# }
#
# resource "aws_rds_cluster_instance" "aurora" {
#   count              = 1
#   identifier         = "${var.project}-${var.environment}-aurora-instance-${count.index + 1}"
#   cluster_identifier = aws_rds_cluster.aurora.id
#   instance_class     = "db.serverless"
#   engine             = "aurora-postgresql"
#   engine_version     = "15.4"
# }