resource "azurerm_static_web_app" "main" {
  name                = "stapp-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location

  sku_tier = "Standard"
  sku_size = "Standard"

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}