resource "azurerm_mssql_server" "main" {
  name                         = "sql-${var.project_name}-${var.environment}"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = random_password.sql_admin_password.result

  public_network_access_enabled = false

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_mssql_database" "main" {
  name      = "inventory"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "Basic"

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Private Endpoint for SQL
resource "azurerm_private_endpoint" "sql" {
  name                = "pe-sql-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoints_subnet_id

  private_service_connection {
    name                           = "psc-sql"
    private_connection_resource_id = azurerm_mssql_server.main.id
    subresource_names              = ["sqlServer"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "dns-group-sql"
    private_dns_zone_ids = [var.sql_private_dns_zone_id]
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}