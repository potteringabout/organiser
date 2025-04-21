resource "aws_iam_policy_attachment" "lambda_vpc_execution" {
  name       = "${var.project}-${var.environment}-lambda-vpc-execution"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  roles      = [aws_iam_role.lambda_exec.name]
}

resource "aws_security_group" "lambda" {
  name   = "${var.project}-${var.environment}-lambda-security-group"
  vpc_id = data.aws_vpc.vpc.id

  # Outbound - allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lambda_function" "lambda" {
  function_name    = "${var.project}-${var.environment}-lambda"
  handler          = "app.lambda_handler"
  runtime          = "python3.13"
  role             = aws_iam_role.lambda_exec.arn
  filename         = "../lambda/app/lambda_package.zip"
  source_code_hash = filebase64sha256("../lambda/app/lambda_package.zip")
  timeout          = 30
  # Enable X-Ray tracing
  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      DB_HOST       = aws_db_instance.rds.address
      DB_PORT       = aws_db_instance.rds.port
      DB_NAME       = aws_db_instance.rds.db_name
      #DB_SECRET_ARN = aws_secretsmanager_secret.postgres_creds.arn
      DB_USERNAME   = local.db_credentials.username
      DB_PASSWORD   = local.db_credentials.password
    }
  }

  vpc_config {
    security_group_ids = [aws_security_group.lambda.id]
    subnet_ids         = toset(data.aws_subnets.app_subnets.ids)
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

