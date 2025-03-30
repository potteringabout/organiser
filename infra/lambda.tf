resource "aws_iam_policy_attachment" "lambda_vpc_execution" {
  name       = "lambda_vpc_execution"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  roles      = [aws_iam_role.lambda_exec.name]
}

resource "aws_lambda_function" "lambda" {
  function_name    = "organiser"
  handler          = "task.lambda_handler"
  runtime          = "python3.9"
  role             = aws_iam_role.lambda_exec.arn
  filename         = "../app/lambda_package.zip"
  source_code_hash = filebase64sha256("../app/lambda_package.zip")
  timeout          = 30
  # Enable X-Ray tracing
  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

