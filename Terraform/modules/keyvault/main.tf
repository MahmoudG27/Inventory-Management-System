data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                = "kv-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  public_network_access_enabled = false

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge"
    ]
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_key_vault_secret" "sql_password" {
  name         = "sql-admin-password"
  value        = var.sql_admin_password
  key_vault_id = azurerm_key_vault.main.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "sql_connection_string" {
  name         = "sql-connection-string"
  value        = "Server=${var.sql_server_fqdn};Database=inventory;User Id=sqladmin;Password=${var.sql_admin_password};Encrypt=true;"
  key_vault_id = azurerm_key_vault.main.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = var.storage_connection_string
  key_vault_id = azurerm_key_vault.main.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "logic_app_url" {
  name         = "logic-app-url"
  value        = var.logic_app_url
  key_vault_id = azurerm_key_vault.main.id

  tags = {
    environment = var.environment
  }
}

# Private Endpoint
resource "azurerm_private_endpoint" "keyvault" {
  name                = "pe-keyvault-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoints_subnet_id

  private_service_connection {
    name                           = "psc-keyvault"
    private_connection_resource_id = azurerm_key_vault.main.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "dns-group-keyvault"
    private_dns_zone_ids = [var.keyvault_private_dns_zone_id]
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}