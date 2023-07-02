resource "aws_vpc" "segbaus-app-vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "segbaus-app-vpc"
  }
}

resource "aws_internet_gateway" "segbaus-app-internet-gateway" {
  vpc_id = aws_vpc.segbaus-app-vpc.id

  tags = {
    Name = "segbaus-app-igw"
  }
}

resource "aws_subnet" "segbaus-app-public-az-1" {
  vpc_id = aws_vpc.segbaus-app-vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "${local.region}a"

  tags = {
    Name = "segbaus-app-public-subnet-az-1"
  }
}

resource "aws_subnet" "segbaus-app-public-az-2" {
  vpc_id = aws_vpc.segbaus-app-vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "${local.region}b"

  tags = {
    Name = "segbaus-app-public-subnet-az-2"
  }
}

resource "aws_route_table" "segbaus-app-public" {
  vpc_id = aws_vpc.segbaus-app-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.segbaus-app-internet-gateway.id
  }

  tags = {
    Name = "segbaus-public-route-table"
  }
}

resource "aws_route_table_association" "segbaus-app-public-access-az-1" {
  route_table_id = aws_route_table.segbaus-app-public.id
  subnet_id = aws_subnet.segbaus-app-public-az-1.id
}

resource "aws_route_table_association" "segbaus-app-public-access-az-2" {
  route_table_id = aws_route_table.segbaus-app-public.id
  subnet_id = aws_subnet.segbaus-app-public-az-2.id
}

resource "aws_security_group" "segbaus-ui-sg" {
  name = "segbaus-ui-sg"
  vpc_id = aws_vpc.segbaus-app-vpc.id

  ingress {
    description = "allow ingress traffic from anywhere"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    security_groups = [aws_security_group.segbaus-ui-alb-sg.id]
  }

  egress {
    description = "allow egress traffic from anywhere"
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource aws_security_group "segbaus-ui-alb-sg" {
  name = "segbaus_ui_alb_sg"
  vpc_id = aws_vpc.segbaus-app-vpc.id

  ingress {
    description = "allow ingress traffic from anywhere"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "allow egress traffic from anywhere"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = [aws_subnet.segbaus-app-public-az-1.cidr_block, aws_subnet.segbaus-app-public-az-2.cidr_block]
  }
}

resource "aws_route53_record" "segbaus-ui-record" {
  zone_id = "Z2MSZC6JPDNG16"
  name   = "segbaus.com"
  type = "A"

  alias {
    name = aws_alb.segbaus-ui-alb.dns_name
    zone_id = aws_alb.segbaus-ui-alb.zone_id
    evaluate_target_health = false
  }
}
