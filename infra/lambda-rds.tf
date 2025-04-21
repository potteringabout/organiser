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
  runtime          = "python3.13"
  timeout          = 10
  filename         = "../lambda/rdsstop/lambda_package.zip"
  source_code_hash = filebase64sha256("../lambda/rdsstop/lambda_package.zip")
}
