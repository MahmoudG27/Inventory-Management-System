resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "web"
}

resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

resource "azurerm_linux_function_app" "main" {
  name                = "func-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id

  site_config {
    application_stack {
      node_version = "18"
    }
  }

  app_settings = {
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
    SQL_CONNECTION_STRING                 = "Server=${azurerm_mssql_server.main.fully_qualified_domain_name};Database=inventory;User Id=sqladmin;Password=${var.sql_admin_password};Encrypt=true;"
    STORAGE_ACCOUNT_NAME                  = azurerm_storage_account.main.name
    STORAGE_ACCOUNT_KEY                   = azurerm_storage_account.main.primary_access_key
  }
}

resource "azurerm_static_web_app_function_app_registration" "example" {
  static_web_app_id = azurerm_static_web_app.example.id
  function_app_id   = azurerm_linux_function_app.example.id
}