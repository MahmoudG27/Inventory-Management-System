output "static_web_app_url" {
  value = "https://${azurerm_static_web_app.main.default_host_name}"
}