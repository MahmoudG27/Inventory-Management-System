# Elastic Premium Plan — بيدعم VNet Integration
resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "EP1"

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_linux_function_app" "main" {
  name                = "func-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location

  storage_account_name       = var.storage_account_name
  storage_account_access_key = var.storage_primary_access_key
  service_plan_id            = azurerm_service_plan.main.id

  # Managed Identity — عشان تتكلم مع Key Vault
  identity {
    type = "SystemAssigned"
  }

  # VNet Integration
  virtual_network_subnet_id = var.functions_subnet_id

  site_config {
    application_stack {
      node_version = "18"
    }
    vnet_route_all_enabled = true
  }

  app_settings = {
    APPLICATIONINSIGHTS_CONNECTION_STRING = var.app_insights_connection_string
    FUNCTIONS_WORKER_RUNTIME              = "node"

    SQL_CONNECTION_STRING     = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/sql-connection-string)"
    STORAGE_CONNECTION_STRING = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/storage-connection-string)"
    LOGIC_APP_URL             = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/logic-app-url)"
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}