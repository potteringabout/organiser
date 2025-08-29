data "aws_route53_zone" "zone" {
  name         = var.zone
  private_zone = false

  provider = aws.dns

}

resource "aws_route53_record" "address" {

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = local.fqdn
  type    = "CNAME"
  ttl     = 5

  records = [aws_cloudfront_distribution.distribution.domain_name]

  provider = aws.dns
}

resource "aws_acm_certificate" "cert" {
  domain_name = local.fqdn

  validation_method = "DNS"

  region = "us-east-1"
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.record]

  provider = aws.dns
}

resource "aws_acm_certificate_validation" "cert_validation" {
  region                  = "us-east-1"  
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}