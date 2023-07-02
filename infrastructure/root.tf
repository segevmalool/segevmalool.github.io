terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.5.0"
    }
  }
}

provider "aws" {
  # Configuration options
  region = "us-west-2"
}

locals {
  segbaus_ui_container_name = "segbaus-ui"
  region = "us-west-2"
}
