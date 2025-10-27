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

resource "aws_iam_policy" "secrets_access" {
  name = "${var.project}-${var.environment}-lambda-secrets-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["secretsmanager:GetSecretValue"],
        Resource = aws_secretsmanager_secret.postgres_creds.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_secrets" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

# -----------------------------
# Provisioned RDS PostgreSQL
# -----------------------------
resource "aws_db_instance" "rds" {
  identifier              = "${var.project}-${var.environment}-postgres"
  engine                  = "postgres"
  engine_version          = "17" # or another stable version
  instance_class          = "db.t4g.micro"
  allocated_storage       = 20
  storage_type            = "gp2"
  db_name                 = "organiser"
  username                = local.db_credentials.username
  password                = local.db_credentials.password
  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = true
  publicly_accessible     = false
  multi_az                = false
  backup_retention_period = 1

  tags = {
    Name = "${var.project}-${var.environment}-postgres",
    Schedule = var.schedule
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
    security_groups = [aws_security_group.lambda.id, aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_idle" {
  alarm_name          = "${var.project}-${var.environment}-rds-idle"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2 # 2 x 5 min = 10 mins
  datapoints_to_alarm = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  statistic           = "Average"
  period              = 300 # 5-minute intervals
  threshold           = 1
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.rds.id
  }

  alarm_description = "Triggers when RDS is idle (no connections) for 10 minutes"
  alarm_actions     = [aws_sns_topic.rds_idle_alarm.arn]
}

resource "aws_sns_topic" "rds_idle_alarm" {
  name = "${var.project}-${var.environment}-rds-idle-topic"
}

resource "aws_sns_topic_subscription" "rds_stop_lambda_sub" {
  topic_arn = aws_sns_topic.rds_idle_alarm.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.rds_control.arn
}

resource "aws_lambda_permission" "sns_invoke_permission" {
  statement_id  = "AllowSNSInvokeRDSControlLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rds_control.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.rds_idle_alarm.arn
}