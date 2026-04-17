output "sql_admin_password" {
  value       = module.sql.sql_admin_password
  sensitive   = true
  description = "SQL admin password (sensitive)"
}

output "runner_admin_password" {
  value       = module.runner.runner_admin_password
  sensitive   = true
  description = "Runner admin password (sensitive)"
}

output "sql_server_fqdn" {
  value = module.sql.sql_server_fqdn
}

output "storage_account_name" {
  value = module.storage.storage_account_name
}

output "key_vault_uri" {
  value = module.keyvault.key_vault_uri
}

output "app_insights_connection_string" {
  value     = module.monitoring.app_insights_connection_string
  sensitive = true
}

output "static_web_app_url" {
  value = module.staticwebapp.static_web_app_url
}