output "api_gateway_url" {
  value = aws_api_gateway_stage.stage.invoke_url
}

output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.distribution.domain_name
}

output "cloudfront_url" {
  value = "https://${var.project}-${var.environment}.${var.zone}"
}

/*output "dynamodb_table_name" {
  value = aws_dynamodb_table.organiser.name
}*/

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

output "rds_dns_name" {
  value = aws_db_instance.rds.address
}

output "ec2_instance_id" {
  value       = var.create_ec2_instance ? aws_instance.linux[0].id : null
  description = "ID of the EC2 instance if created"
}


output "rds_connect_command" {
  value = var.create_ec2_instance ? "To connect to the RDS instance, run the following command in your terminal:\n\n aws ssm start-session --target ${aws_instance.linux[0].id} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{\"host\":[\"${aws_db_instance.rds.address}\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"5432\"]}'\n\nUsername: dbadmin\nDatabase: organiser\nPassword: See secrets manager ( ${var.project}-${var.environment}-postgres-creds)" : null
  description = "The command to connect to the RDS instance"
}