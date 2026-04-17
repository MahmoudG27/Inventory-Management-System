variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "runner_subnet_id" {
  type        = string
  description = "Subnet ID for the runner VM"
}

variable "admin_username" {
  type    = string
  default = "runneradmin"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo in format owner/repo-name"
}

variable "github_runner_token" {
  type        = string
  sensitive   = true
  description = "GitHub Actions runner registration token"
}