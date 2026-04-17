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

variable "private_endpoints_subnet_id" {
  type        = string
  description = "Subnet ID for private endpoint"
}

variable "keyvault_private_dns_zone_id" {
  type        = string
  description = "Private DNS Zone ID for Key Vault"
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
}

variable "sql_server_fqdn" {
  type = string
}

variable "storage_connection_string" {
  type      = string
  sensitive = true
}

variable "logic_app_url" {
  type      = string
  sensitive = true
}

variable "tenant_id" {
  type        = string
  description = "Azure AD Tenant ID"
}