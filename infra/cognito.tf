resource "aws_cognito_user_pool" "user_pool" {
  name = "organiser_user_pool"
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "organiser_user_pool_client" # Fixed double underscore
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]

  access_token_validity  = 4  # 4 hours in minutes
  id_token_validity      = 4  # 4 hours in minutes
  refresh_token_validity = 24 # 1 day in minutes

  allowed_oauth_flows = [
    "code",
    "implicit"
  ]

  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile"
  ]

  allowed_oauth_flows_user_pool_client = false
  callback_urls                        = ["https://${aws_cloudfront_distribution.distribution.domain_name}/callback"]
  #callback_urls                        = ["https://d3731pww2dbm89.cloudfront.net/callback"]
  #logout_urls                          = ["https://d3731pww2dbm89.cloudfront.net/logout"]
  logout_urls                          = ["https://${aws_cloudfront_distribution.distribution.domain_name}/logout"]
}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain       = "organiser"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}
/*
import {
  to = aws_cognito_user_pool_domain.user_pool_domain
  id = "organiser"
}

import {
  to = aws_cognito_resource_server.resource_server
  id = "eu-west-2_Qv91VSnrS|api.organiser.potteringabout.net"
}*/

resource "aws_cognito_resource_server" "resource_server" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  identifier   = "api.organiser.potteringabout.net"
  name         = "Organiser Resource Server"

  scope {
    scope_name        = "read"
    scope_description = "Read access"
  }

  scope {
    scope_name        = "write"
    scope_description = "Write access"
  }
}

