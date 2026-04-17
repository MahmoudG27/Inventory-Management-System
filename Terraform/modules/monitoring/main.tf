resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_monitor_action_group" "main" {
  name                = "ag-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  short_name          = "InvAlerts"

  email_receiver {
    name          = "admin-email"
    email_address = "admin@inventory.com"
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}