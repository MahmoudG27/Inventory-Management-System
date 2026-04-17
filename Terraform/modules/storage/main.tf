resource "azurerm_storage_account" "main" {
  name                     = "st${var.project_name}${var.environment}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  public_network_access_enabled = false

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Container for images
resource "azurerm_storage_container" "product_images" {
  name                  = "product-images"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "private"
}

# Private Endpoint
resource "azurerm_private_endpoint" "storage" {
  name                = "pe-storage-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoints_subnet_id

  private_service_connection {
    name                           = "psc-storage"
    private_connection_resource_id = azurerm_storage_account.main.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "dns-group-storage"
    private_dns_zone_ids = [var.storage_private_dns_zone_id]
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}