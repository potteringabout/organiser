# Define the WAF
resource "aws_wafv2_web_acl" "waf" {
  provider    = aws.us_east_1
  name        = "organiser_waf"
  scope       = "CLOUDFRONT"
  description = "WAF for CloudFront"
  default_action {
    allow {}
  }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "waf"
    sampled_requests_enabled   = true
  }
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }
}


# Define the S3 bucket
resource "aws_s3_bucket" "bucket" {
  #bucket = "potterinabout-organiser-static-content"
  bucket = "potteringabout-${var.project}-${var.environment}-static-content"
}

resource "aws_ssm_parameter" "bucket_name" {
  name  = "/${var.project}/${var.environment}/static-content-bucket"
  type  = "SecureString"
  value = aws_s3_bucket.bucket.bucket
}

resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name  = "/${var.project}/${var.environment}/cloudfront-distribution-id"
  type  = "SecureString"
  value = aws_cloudfront_distribution.distribution.id
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn]
    }
  }
}

# Attach the necessary bucket policy to allow CloudFront to access the S3 bucket
resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.bucket.id

  policy = data.aws_iam_policy_document.s3_policy.json
}

data "aws_cloudfront_cache_policy" "cache_policy" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "origin_request_policy" {
  name = "Managed-AllViewerExceptHostHeader"
}

# Define the CloudFront distribution
resource "aws_cloudfront_distribution" "distribution" {
  origin {
    domain_name = aws_s3_bucket.bucket.bucket_regional_domain_name
    origin_id   = "s3_origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = "${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com"
    origin_id   = "api_gateway_origin"
    origin_path = "/dev"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution Organiser"
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id       = "s3_origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
      headers = ["X-Amzn-Trace-Id"]
    }

    # Enable X-Ray tracing
    #enable_tracing = true

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "api_gateway_origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "DELETE", "PATCH"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = data.aws_cloudfront_cache_policy.cache_policy.id

    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.origin_request_policy.id

    /*forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = ["*"]
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0*/
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cert_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  aliases = ["${var.project}-${var.environment}.${var.zone}"]

  # Associate the Real-Time Log Configuration
  #realtime_log_config_arn = aws_cloudfront_realtime_log_config.realtime_logs.arn


  web_acl_id = aws_wafv2_web_acl.waf.arn

  #depends_on = [aws_api_gateway_rest_api.api]
}

# Define the CloudFront origin access identity
resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "Access identity for S3 bucket"
}

resource "aws_cloudwatch_log_group" "cloudfront_log_group" {
  name              = "/${var.project}/${var.environment}/cloudfront"
  retention_in_days = 7
}

# Create a Real-Time Log Configuration
/*resource "aws_cloudfront_realtime_log_config" "realtime_logs" {
  name          = "realtime-log-config"
  sampling_rate = 100.0 # Log 100% of requests (adjust as needed)

  endpoint {
    stream_type = "cloudwatch-logs"
    arn         = aws_cloudwatch_log_group.cloudfront_log_group.arn
  }

  fields = [
    "timestamp",
    "c-ip",
    "cs-method",
    "cs-protocol",
    "cs-host",
    "cs-uri-stem",
    "sc-status",
    "sc-bytes",
    "time-taken",
    "x-edge-location",
    "cs-user-agent"
  ]
}*/



