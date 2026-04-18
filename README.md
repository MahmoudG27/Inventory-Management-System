# 📦 Cloud-Based Inventory Management System

A production-ready internal inventory management system built on Microsoft Azure. Designed for business owners and employees to manage products, track stock levels, record sales, and receive automated low-stock alerts.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Virtual Network                          │
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────────┐ │
│  │  Azure Functions │◄────────►│        Key Vault             │ │
│  │  (API Backend)   │          │  (Secrets & Credentials)     │ │
│  └────────┬─────────┘          └──────────────────────────────┘ │
│           │                                                      │
│  ┌────────▼─────────┐          ┌──────────────────────────────┐ │
│  │   Azure SQL DB   │          │     Storage Account          │ │
│  │  (inventory DB)  │          │   (Product Images Blob)      │ │
│  └──────────────────┘          └──────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────────────────┐ │
│  │   Logic Apps     │          │   Application Insights       │ │
│  │ (Stock Alerts)   │          │      (Monitoring)            │ │
│  └──────────────────┘          └──────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  Self-hosted     │  ← GitHub Actions CI/CD Runner           │
│  │  Runner VM       │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
              ▲
              │ HTTPS + Azure AD Auth
              │
┌─────────────▼─────────────────┐
│   Azure Static Web Apps       │
│   (React Frontend)  [Public]  │
└───────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, MSAL (Azure AD Authentication) |
| Backend | Azure Functions v4 (Node.js 18) |
| Database | Azure SQL Database (MSSQL) |
| Storage | Azure Blob Storage (Product Images) |
| Authentication | Azure Active Directory (MSAL) |
| Automation | Azure Logic Apps (Stock Alerts) |
| Monitoring | Application Insights + Azure Monitor |
| Secrets | Azure Key Vault |
| Infrastructure | Terraform (Modular) |
| CI/CD | GitHub Actions + Self-hosted Runner |

---

## 📁 Project Structure

```
Inventory-Management-System/
├── frontend/                          # React Application
│   ├── src/
│   │   ├── api/
│   │   │   ├── index.js              # API calls (axios)
│   │   │   └── msalInstance.js       # MSAL instance
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Products.js           # Products list + image upload
│   │   │   ├── AddProduct.js         # Add new product form
│   │   │   ├── Sales.js              # Sales recording + history
│   │   │   └── Login.js              # Microsoft login page
│   │   ├── authConfig.js             # Azure AD configuration
│   │   └── App.js
│   └── package.json
│
├── functions/                         # Azure Functions (Backend)
│   ├── src/
│   │   ├── database.js               # SQL connection pool
│   │   └── functions/
│   │       ├── GetProducts.js        # GET /api/products
│   │       ├── GetProductById.js     # GET /api/products/{id}
│   │       ├── CreateProduct.js      # POST /api/products
│   │       ├── UpdateProduct.js      # PUT /api/products/{id}
│   │       ├── DeleteProduct.js      # DELETE /api/products/{id}
│   │       ├── UploadProductImage.js # POST /api/products/{id}/image
│   │       ├── GetSales.js           # GET /api/sales
│   │       ├── CreateSale.js         # POST /api/sales
│   │       └── StockMonitor.js       # Timer trigger (hourly)
│   ├── host.json
│   ├── local.settings.json           # (not committed - see .gitignore)
│   └── package.json
│
├── Terraform/                         # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── networking/               # VNet, Subnets, NSG, Private DNS
│       ├── sql/                      # Azure SQL + Private Endpoint
│       ├── storage/                  # Storage Account + Private Endpoint
│       ├── functions/                # Function App + VNet Integration
│       ├── keyvault/                 # Key Vault + Secrets
│       ├── monitoring/               # App Insights + Alerts
│       ├── staticwebapp/             # Static Web App
│       ├── logicapp/                 # Logic Apps Standard
│       └── runner/                   # Self-hosted GitHub Runner VM
│
└── .github/
    └── workflows/
        ├── deploy-frontend.yml       # Deploy React to Static Web Apps
        └── deploy-functions.yml      # Deploy Functions (self-hosted runner)
```

---

## 🗄️ Database Schema

```
users ──────────────────────────────────────────────────────────────┐
│ id (PK) │ email │ display_name │ role │ is_active │ created_at    │
└──────────────────────────────────────────────────────────────────┘
     │                           │
     ▼                           ▼
products                       sales
│ id (PK)           │          │ id (PK)              │
│ sku (UNIQUE)      │          │ sale_reference        │
│ name              │          │ processed_by (FK)     │
│ category          │          │ total_amount          │
│ unit_price        │          │ notes                 │
│ quantity_in_stock │          │ sale_date             │
│ low_stock_threshold│         └──────────┬────────────┘
│ image_url         │                     │
│ created_by (FK)   │          ┌──────────▼────────────┐
└────────┬──────────┘          │      sale_items        │
         │                     │ id (PK)               │
         ├────────────────────►│ sale_id (FK)          │
         │                     │ product_id (FK)       │
         ▼                     │ quantity              │
stock_movements                │ unit_price_at_sale    │
│ id (PK)          │           │ subtotal (computed)   │
│ product_id (FK)  │           └───────────────────────┘
│ movement_type    │
│ quantity_change  │
│ reason           │
│ created_at       │
└──────────────────┘
```

---

## 🔌 API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (filter by `?category=`) |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product (blocked if has sales) |
| POST | `/api/products/{id}/image` | Upload product image to Blob Storage |

### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | Get all sales with items |
| POST | `/api/sales` | Create sale (reduces stock, logs movement) |

### Example: Create Sale

```json
POST /api/sales
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ],
  "notes": "Walk-in customer"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "sale_id": 42,
    "sale_reference": "SAL-20260412-2G9HLF"
  }
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Azure CLI
- Azure Functions Core Tools v4
- Terraform v4.x
- An Azure Subscription

### Local Development

**1 — Clone the repo**

```bash
git clone https://github.com/YOUR_USERNAME/Inventory-Management-System.git
cd Inventory-Management-System
```

**2 — Setup Functions**

```bash
cd functions
npm install
```

Create `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "YOUR_STORAGE_CONNECTION_STRING",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "SQL_SERVER": "YOUR_SERVER.database.windows.net",
    "SQL_DATABASE": "inventory",
    "SQL_USER": "sqladmin",
    "SQL_PASSWORD": "YOUR_PASSWORD",
    "STORAGE_CONNECTION_STRING": "YOUR_STORAGE_CONNECTION_STRING",
    "LOGIC_APP_URL": "YOUR_LOGIC_APP_URL"
  }
}
```

```bash
func start
```

**3 — Setup Frontend**

```bash
cd frontend
npm install
npm start
```

App runs on `http://localhost:3000`

---

## ☁️ Infrastructure Deployment (Terraform)

```bash
cd Terraform

# Initialize
terraform init

# Plan
terraform plan \
  -var="subscription_id=YOUR_SUB_ID" \
  -var="tenant_id=YOUR_TENANT_ID" \
  -var="sql_admin_password=YourStr0ngP@ss!" \
  -var="logic_app_url=YOUR_LOGIC_APP_URL" \
  -var="admin_password=RunnerP@ss!" \
  -var="github_repo=YOUR_USERNAME/Inventory-Management-System" \
  -var="github_runner_token=YOUR_RUNNER_TOKEN"

# Apply
terraform apply
```

### Terraform Modules

| Module | Resources Created |
|--------|------------------|
| `networking` | VNet, 3 Subnets, NSG, Private DNS Zones |
| `sql` | SQL Server, Database, Private Endpoint |
| `storage` | Storage Account, Blob Container, Private Endpoint |
| `functions` | Function App, Elastic Premium Plan, VNet Integration |
| `keyvault` | Key Vault, Secrets, Private Endpoint |
| `monitoring` | App Insights, Log Analytics, 3 Alert Rules |
| `staticwebapp` | Static Web App (Standard tier) |
| `logicapp` | Logic App Standard, WorkflowStandard Plan |
| `runner` | Ubuntu VM as GitHub Self-hosted Runner |

---

## 🔄 CI/CD Pipeline

### Frontend Deployment

Triggered on push to `master` when files change in `frontend/`:

```
git push → GitHub Actions → Azure Static Web Apps Deploy
```

### Functions Deployment

Triggered on push to `master` when files change in `functions/`:

```
git push → Self-hosted Runner (inside VNet) → Azure Functions Deploy
```

The self-hosted runner runs inside the VNet, allowing it to reach the private Function App endpoint.

---

## 🔐 Security

- All Azure services (SQL, Storage, Key Vault, Functions) are inside a **Virtual Network** with **Private Endpoints** — no public internet access
- All secrets stored in **Azure Key Vault** — referenced in Function App settings via Key Vault references (`@Microsoft.KeyVault(...)`)
- Authentication via **Azure Active Directory** — JWT tokens validated on every request
- **CORS** restricted to Static Web App URL only
- **NSG rules** on Functions subnet — only HTTPS inbound allowed

---

## 📊 Monitoring

| Alert | Condition | Severity |
|-------|-----------|----------|
| Function Failures | > 3 failures in 5 min | Warning |
| Slow Response Time | > 3000ms average | Warning |
| High Memory Usage | > 512MB average | Warning |

Custom logs tracked in Application Insights:

```kusto
traces
| where message startswith "SALE_CREATED"
    or message startswith "PRODUCT_CREATED"
    or message startswith "STOCK_CHECK"
| order by timestamp desc
```

---

## 📧 Stock Alert Flow

```
StockMonitor (Timer - every hour)
    → Query products WHERE quantity <= low_stock_threshold
    → POST to Logic App HTTP trigger
    → Logic App sends email alert
```

---

## 🔧 Environment Variables

### Azure Function App Settings

| Variable | Description |
|----------|-------------|
| `SQL_CONNECTION_STRING` | Azure SQL connection string (from Key Vault) |
| `STORAGE_CONNECTION_STRING` | Storage account connection string (from Key Vault) |
| `LOGIC_APP_URL` | Logic App HTTP trigger URL (from Key Vault) |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string |

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👤 Author

**Mahmoud Gamal**
Cloud & DevOps Engineer
