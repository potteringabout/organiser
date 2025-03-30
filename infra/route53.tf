data "aws_route53_zone" "zone" {
  name         = var.zone
  private_zone = false

  provider = aws.dns

}

resource "aws_route53_record" "address" {
 
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = "${var.project}-${var.environment}"
  type    = "CNAME"
  ttl     = 5

  records = [aws_cloudfront_distribution.distribution.domain_name]

  provider = aws.dns
}