resource "aws_iam_policy_attachment" "lambda_rds_vpc_execution" {
  name       = "${var.project}-${var.environment}-lambda-rds-control"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  roles      = [aws_iam_role.lambda_rds.name]
}

resource "aws_security_group" "lambda_rds" {
  name   = "${var.project}-${var.environment}-lambda-rds-security-group"
  vpc_id = data.aws_vpc.vpc.id

  # Outbound - allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lambda_function" "rds_control" {
  function_name    = "${var.project}-${var.environment}-rds-control"
  role             = aws_iam_role.lambda_rds.arn
  handler          = "rds_control.lambda_handler"
  runtime          = "python3.11"
  timeout          = 10
  filename         = "../lambda/rdsstop/lambda_package.zip"
  source_code_hash = filebase64sha256("../lambda/rdsstop/lambda_package.zip")

  environment {
    variables = {
      DB_HOST       = aws_db_instance.rds.address
      DB_PORT       = aws_db_instance.rds.port
      DB_NAME       = aws_db_instance.rds.db_name
      DB_SECRET_ARN = aws_secretsmanager_secret.postgres_creds.arn
    }
  }

  vpc_config {
    security_group_ids = [aws_security_group.lambda_rds.id]
    subnet_ids         = toset(data.aws_subnets.app_subnets.ids)
  }
}
