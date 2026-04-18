resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

module "networking" {
  source = "./modules/networking"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

module "sql" {
  source = "./modules/sql"

  project_name                = var.project_name
  environment                 = var.environment
  location                    = var.location
  resource_group_name         = azurerm_resource_group.main.name
  private_endpoints_subnet_id = module.networking.private_endpoints_subnet_id
  sql_private_dns_zone_id     = module.networking.sql_private_dns_zone_id
}

module "storage" {
  source = "./modules/storage"

  project_name                = var.project_name
  environment                 = var.environment
  location                    = var.location
  resource_group_name         = azurerm_resource_group.main.name
  private_endpoints_subnet_id = module.networking.private_endpoints_subnet_id
  storage_private_dns_zone_id = module.networking.storage_private_dns_zone_id
}

module "monitoring" {
  source = "./modules/monitoring"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

module "keyvault" {
  source = "./modules/keyvault"

  project_name                 = var.project_name
  environment                  = var.environment
  location                     = var.location
  resource_group_name          = azurerm_resource_group.main.name
  private_endpoints_subnet_id  = module.networking.private_endpoints_subnet_id
  keyvault_private_dns_zone_id = module.networking.keyvault_private_dns_zone_id
  tenant_id                    = var.tenant_id
  sql_admin_password           = module.sql.sql_admin_password
  sql_server_fqdn              = module.sql.sql_server_fqdn
  storage_connection_string    = module.storage.storage_connection_string
  logic_app_url                = var.logic_app_url
}

module "functions" {
  source = "./modules/functions"

  project_name                   = var.project_name
  environment                    = var.environment
  location                       = var.location
  resource_group_name            = azurerm_resource_group.main.name
  functions_subnet_id            = module.networking.functions_subnet_id
  storage_account_name           = module.storage.storage_account_name
  storage_primary_access_key     = module.storage.storage_primary_access_key
  app_insights_connection_string = module.monitoring.app_insights_connection_string
  key_vault_uri                  = module.keyvault.key_vault_uri

  allowed_cors_origins = [
    "http://localhost:3000",
    module.staticwebapp.static_web_app_url
  ]
}

module "runner" {
  source = "./modules/runner"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  runner_subnet_id    = module.networking.runner_subnet_id
  github_repo         = var.github_repo
  github_runner_token = var.github_runner_token
}

module "staticwebapp" {
  source = "./modules/staticwebapp"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_key_vault_access_policy" "function" {
  key_vault_id = module.keyvault.key_vault_id
  tenant_id    = var.tenant_id
  object_id    = module.functions.function_app_principal_id

  secret_permissions = ["Get", "List"]
}

resource "azurerm_static_web_app_function_app_registration" "link" {
  static_web_app_id = module.staticwebapp.static_web_app_id
  function_app_id   = module.functions.function_app_id
}

# Alert 1 — Function Failures
resource "azurerm_monitor_metric_alert" "function_failures" {
  name                = "alert-function-failures-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [module.functions.function_app_id]
  description         = "Alert when function failures exceed threshold"
  severity            = 2
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "FunctionExecutionUnits"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 3
  }

  action {
    action_group_id = module.monitoring.action_group_id
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Alert 2 — High Response Time
resource "azurerm_monitor_metric_alert" "slow_response" {
  name                = "alert-slow-response-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [module.functions.function_app_id]
  description         = "Alert when response time exceeds 3 seconds"
  severity            = 2
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 3
  }

  action {
    action_group_id = module.monitoring.action_group_id
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Alert 3 — High Memory Usage
resource "azurerm_monitor_metric_alert" "high_memory" {
  name                = "alert-high-memory-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [module.functions.function_app_id]
  description         = "Alert when memory usage is high"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "MemoryWorkingSet"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 536870912 # 512 MB
  }

  action {
    action_group_id = module.monitoring.action_group_id
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}