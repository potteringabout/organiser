resource "aws_security_group" "ec2" {
  name   = "${var.project}-${var.environment}-ec2-security-group"
  vpc_id = data.aws_vpc.vpc.id

  # Outbound - allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "ssm_role" {
  count = var.create_ec2_instance ? 1 : 0

  name = "${var.project}-${var.environment}-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Effect = "Allow"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_managed_policy" {
  count      = var.create_ec2_instance ? 1 : 0
  role       = aws_iam_role.ssm_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm_instance_profile" {
  count = var.create_ec2_instance ? 1 : 0
  name  = "${var.project}-${var.environment}-ssm-instance-profile"
  role  = aws_iam_role.ssm_role[0].name
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-kernel-*-x86_64-gp2"]
  }
}

resource "aws_instance" "linux" {
  count                       = var.create_ec2_instance ? 1 : 0
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = "t3.nano"
  subnet_id                   = data.aws_subnet.pub_subnets[0].id # Replace or add subnet data
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ssm_instance_profile[0].name
  associate_public_ip_address = true

  tags = {
    Name = "${var.project}-${var.environment}-linux-ec2"
  }
}
