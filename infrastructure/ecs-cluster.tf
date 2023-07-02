resource "aws_ecs_cluster" "segbaus-app" {
  name = "segbaus-app"
}

resource "aws_ecs_cluster_capacity_providers" "segbaus-app-fargate-capacity-provider" {
  cluster_name = aws_ecs_cluster.segbaus-app.name
  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    base = 1
    weight = 100
  }
}
