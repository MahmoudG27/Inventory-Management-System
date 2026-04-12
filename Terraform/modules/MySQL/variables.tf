variable "resource_group_name" {}
variable "location" {}

################################

# Flexible MySQL Server
variable "mysql_name" {
  type    = string
}
variable "mysql_user" {
  type    = string
}
variable "mysql_version" {
  type    = string
}
variable "mysql_sku" {
  type    = string
}