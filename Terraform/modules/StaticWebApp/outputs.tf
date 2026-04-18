output "static_web_app_id" {
  value = azurerm_static_web_app.main.id
}

output "static_web_app_url" {
  value = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "default_host_name" {
  value = azurerm_static_web_app.main.default_host_name
}