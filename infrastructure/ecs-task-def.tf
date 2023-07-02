resource "aws_ecs_task_definition" "segbaus-ui" {
  family = "segbaus-ui-taskdef"

  container_definitions = <<TASK_DEFINITION
[{
  "name": "${local.segbaus_ui_container_name}",
  "image": "266455520073.dkr.ecr.us-west-2.amazonaws.com/segbaus-ui:latest",
  "essential": true,
  "portMappings": [
    {
      "containerPort": 80,
      "hostPort": 80
    }
  ]
}]
TASK_DEFINITION

  requires_compatibilities = ["FARGATE"]
  cpu = 512
  memory = 1024

  execution_role_arn = "arn:aws:iam::266455520073:role/ecsTaskExecutionRole"
  task_role_arn = "arn:aws:iam::266455520073:role/segbaus-ui-task-role"
  network_mode = "awsvpc"

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture = "X86_64"
  }

  skip_destroy = true
}
