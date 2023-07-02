resource aws_alb_target_group segbaus-ui-tg {
  name = "segbaus-ui"
  port = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = aws_vpc.segbaus-app-vpc.id
}

resource aws_alb segbaus-ui-alb {
  name = "segbaus-ui-alb"
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.segbaus-ui-alb-sg.id]
  subnets = [aws_subnet.segbaus-app-public-az-1.id, aws_subnet.segbaus-app-public-az-2.id]
}

resource aws_alb_listener segbaus-ui-alb-listener {
  load_balancer_arn = aws_alb.segbaus-ui-alb.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.segbaus-ui-tg.arn
  }
}