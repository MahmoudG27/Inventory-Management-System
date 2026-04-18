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

variable "functions_subnet_id" {
  type        = string
  description = "Subnet ID for VNet Integration"
}

variable "storage_account_name" {
  type = string
}

variable "storage_primary_access_key" {
  type      = string
  sensitive = true
}

variable "app_insights_connection_string" {
  type      = string
  sensitive = true
}

variable "key_vault_uri" {
  type = string
}

variable "allowed_cors_origins" {
  type    = list(string)
  default = []
}