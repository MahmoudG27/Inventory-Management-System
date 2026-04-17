variable "project_name" {
  description = "Project name used in all resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "tenant_id" {
  type        = string
  description = "Azure AD Tenant ID"
}

variable "logic_app_url" {
  type      = string
  sensitive = true
}

variable "github_repo" {
  type = string
}

variable "github_runner_token" {
  type      = string
  sensitive = true
}