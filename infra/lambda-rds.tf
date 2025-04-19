resource "aws_lambda_function" "rds_control" {
  function_name = "${var.project}-${var.environment}-rds-control"
  role          = aws_iam_role.rds_control_lambda.arn
  handler       = "rds_control.lambda_handler"
  runtime       = "python3.11"
  timeout       = 10
  filename         = "../lambda/rdsstop/lambda_package.zip"
  source_code_hash = filebase64sha256("../lambda/rdsstop/lambda_package.zip")
  
  environment {
    variables = {
      RDS_INSTANCE_ID = aws_db_instance.postgres.id
    }
  }
}
