resource "aws_lambda_function" "rds_control" {
  function_name    = "${var.project}-${var.environment}-rds-control"
  role             = aws_iam_role.lambda_rds.arn
  handler          = "rds_control.lambda_handler"
  runtime          = "python3.13"
  timeout          = 300
  filename         = "../lambda/rdsstop/lambda_package.zip"
  source_code_hash = filebase64sha256("../lambda/rdsstop/lambda_package.zip")
}
