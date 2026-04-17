resource "azurerm_network_interface" "runner" {
  name                = "nic-runner-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.runner_subnet_id
    private_ip_address_allocation = "Dynamic"
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_linux_virtual_machine" "runner" {
  name                            = "vm-runner-${var.environment}"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  size                            = "Standard_B1s"
  admin_username                  = var.admin_username
  admin_password                  = random_password.sql_admin_password.result
  disable_password_authentication = false

  network_interface_ids = [azurerm_network_interface.runner.id]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  custom_data = base64encode(<<-EOF
    #!/bin/bash
    set -e

    apt-get update -y
    apt-get install -y curl git nodejs npm

    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs

    npm install -g azure-functions-core-tools@4 --unsafe-perm true

    curl -sL https://aka.ms/InstallAzureCLIDeb | bash

    useradd -m runner
    cd /home/runner

    mkdir actions-runner && cd actions-runner
    curl -o actions-runner-linux-x64-2.333.1.tar.gz -L \
      https://github.com/actions/runner/releases/download/v2.333.1/actions-runner-linux-x64-2.333.1.tar.gz
    tar xzf ./actions-runner-linux-x64-2.333.1.tar.gz
    chown -R runner:runner /home/runner/actions-runner

    sudo -u runner ./config.sh \
      --url https://github.com/${var.github_repo} \
      --token ${var.github_runner_token} \
      --name "azure-vnet-runner" \
      --labels "self-hosted,azure,vnet" \
      --unattended

    ./svc.sh install runner
    ./svc.sh start
  EOF
  )

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}