terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.68.0"
    }
  }
}


provider "azurerm" {
  features {}

  subscription_id                 = "1650eff4-9462-45fc-9432-0c58630eb89d"
  resource_provider_registrations = "none"
}