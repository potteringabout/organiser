resource "aws_cloudwatch_query_definition" "query_errors" {
  name = "High Error Count in Logs"

  log_group_names = [
    "/aws/api-gateway/${var.project}-${var.environment}",
    "/aws/lambda/${var.project}-${var.environment}-lambda",
    "/${var.project}/${var.environment}/cloudfront"
  ]

  query_string = <<-QUERY
    fields @timestamp, @message
    | filter @message like /ERROR/
    | sort @timestamp desc
    | limit 20
  QUERY
}