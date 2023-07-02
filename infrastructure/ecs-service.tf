resource "aws_ecs_service" "segbaus-ui-service" {
  name = "segbaus-ui-service"
  force_new_deployment = true

  cluster = aws_ecs_cluster.segbaus-app.id
  task_definition = "${aws_ecs_task_definition.segbaus-ui.family}:${aws_ecs_task_definition.segbaus-ui.revision}"

  desired_count = 1
  launch_type = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.segbaus-ui-sg.id]
    subnets = [aws_subnet.segbaus-app-public-az-1.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.segbaus-ui-tg.arn
    container_name = local.segbaus_ui_container_name
    container_port = 80
  }
}
