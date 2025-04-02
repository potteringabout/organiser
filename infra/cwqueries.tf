resource "aws_cloudwatch_query_definition" "query_errors" {
  name = "Organiser/Combined Logs"

  log_group_names = [
    "/aws/apigateway/${var.project}-${var.environment}",
    "/aws/lambda/${var.project}-${var.environment}-lambda",
    "/${var.project}/${var.environment}/cloudfront"
  ]

  query_string = <<-QUERY
    fields @timestamp, @message
    | sort @timestamp desc
    | limit 20
  QUERY
}