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

variable "sql_private_dns_zone_id" {
  type        = string
  description = "Private DNS Zone ID for SQL"
}