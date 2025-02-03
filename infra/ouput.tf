output "api_gateway_url" {
  value = aws_api_gateway_stage.stage.invoke_url
}

output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.distribution.domain_name
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.organiser.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.bucket.bucket
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.user_pool.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.user_pool_client.id
}

output "cognito_user_pool_domain" {
  value = aws_cognito_user_pool_domain.user_pool_domain.domain
}