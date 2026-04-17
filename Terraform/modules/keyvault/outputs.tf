output "key_vault_id" {
  value = azurerm_key_vault.main.id
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "sql_connection_string_secret_uri" {
  value = azurerm_key_vault_secret.sql_connection_string.versionless_id
}

output "storage_connection_string_secret_uri" {
  value = azurerm_key_vault_secret.storage_connection_string.versionless_id
}

output "logic_app_url_secret_uri" {
  value = azurerm_key_vault_secret.logic_app_url.versionless_id
}