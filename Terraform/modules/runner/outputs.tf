output "runner_vm_id" {
  value = azurerm_linux_virtual_machine.runner.id
}

output "runner_private_ip" {
  value = azurerm_network_interface.runner.private_ip_address
}

output "runner_admin_password" {
  value       = random_password.sql_admin_password.result
  sensitive   = true
  description = "Runner admin password (sensitive)"
}