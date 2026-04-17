output "sql_server_id" {
  value = azurerm_mssql_server.main.id
}

output "sql_server_fqdn" {
  description = "DNS name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_database_name" {
  value = azurerm_mssql_database.main.name
}

output "sql_admin_password" {
  value       = random_password.sql_admin_password.result
  sensitive   = true
  description = "SQL admin password (sensitive)"
}