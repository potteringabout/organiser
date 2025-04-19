# -----------------------------
# Credentials in Secrets Manager
# -----------------------------
resource "random_password" "postgres_password" {
  length  = 20
  special = true
}

resource "aws_secretsmanager_secret" "postgres_creds" {
  name = "${var.project}-${var.environment}-postgres-creds"
}

resource "aws_secretsmanager_secret_version" "postgres_creds_version" {
  secret_id = aws_secretsmanager_secret.postgres_creds.id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.postgres_password.result
  })
}

data "aws_secretsmanager_secret_version" "postgres_creds" {
  secret_id  = aws_secretsmanager_secret.postgres_creds.id
  depends_on = [aws_secretsmanager_secret_version.postgres_creds_version]
}

locals {
  db_credentials = jsondecode(data.aws_secretsmanager_secret_version.postgres_creds.secret_string)
}

# -----------------------------
# Provisioned RDS PostgreSQL
# -----------------------------
resource "aws_db_instance" "postgres" {
  identifier           = "${var.project}-${var.environment}-postgres"
  engine               = "postgres"
  engine_version       = "15.5"                     # or another stable version
  instance_class       = "db.t4g.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  db_name              = "organiser"
  username             = local.db_credentials.username
  password             = local.db_credentials.password
  db_subnet_group_name = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot  = true
  publicly_accessible  = false
  multi_az             = false
  backup_retention_period = 1

  tags = {
    Name = "${var.project}-${var.environment}-postgres"
  }
}

# Subnet group
resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project}-${var.environment}-aurora-subnet-group"
  subnet_ids = toset(data.aws_subnets.data_subnets.ids)

  tags = {
    Name = "${var.project}-${var.environment}-aurora-subnet-group"
  }
}

# Security group
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