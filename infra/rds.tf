resource "aws_rds_cluster" "aurora" {
  cluster_identifier = "${var.project}-${var.environment}-aurora"
  engine             = "aurora-postgresql"
  engine_mode        = "serverless" # Replace with the appropriate mode when available for serverless v2

  serverlessv2_scaling_configuration {
    max_capacity             = 1.0
    min_capacity             = 0.0
    seconds_until_auto_pause = 300
  }

  # VPC configuration
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  db_subnet_group_name = aws_db_subnet_group.aurora.id
}

resource "aws_rds_cluster_instance" "aurora" {
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}


resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project}-${var.environment}-aurora-subnet-group"
  subnet_ids = toset(data.aws_subnets.data_subnets.ids)

  tags = {
    Name = "${var.project}-${var.environment}-aurora-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.project}-${var.environment}-rds-security-group"
  vpc_id = data.aws_vpc.vpc.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    description     = "Allow inbound MySQL access"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}