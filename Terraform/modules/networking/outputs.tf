output "vnet_id" {
  value = azurerm_virtual_network.main.id
}

output "vnet_name" {
  value = azurerm_virtual_network.main.name
}

output "functions_subnet_id" {
  value = azurerm_subnet.functions.id
}

output "runner_subnet_id" {
  value = azurerm_subnet.runner.id
}

output "private_endpoints_subnet_id" {
  value = azurerm_subnet.private_endpoints.id
}

output "sql_private_dns_zone_id" {
  value = azurerm_private_dns_zone.sql.id
}

output "storage_private_dns_zone_id" {
  value = azurerm_private_dns_zone.storage.id
}

output "keyvault_private_dns_zone_id" {
  value = azurerm_private_dns_zone.keyvault.id
}