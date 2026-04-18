-- جدول المستخدمين (بيتزامن مع Azure AD)
CREATE TABLE users (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    email            NVARCHAR(255) NOT NULL UNIQUE,
    display_name     NVARCHAR(255) NOT NULL,
    role             NVARCHAR(50)  NOT NULL DEFAULT 'employee'
                     CHECK (role IN ('admin', 'employee')),
    is_active        BIT           NOT NULL DEFAULT 1,
    created_at       DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

-- جدول المنتجات
CREATE TABLE products (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    sku                 NVARCHAR(50)   NOT NULL UNIQUE,
    name                NVARCHAR(255)  NOT NULL,
    category            NVARCHAR(100)  NOT NULL,
    unit_price          DECIMAL(10,2)  NOT NULL CHECK (unit_price >= 0),
    quantity_in_stock   INT            NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    low_stock_threshold INT            NOT NULL DEFAULT 5,
    image_url           NVARCHAR(500)  NULL,
    created_by          UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at          DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- جدول المبيعات (الفاتورة الرئيسية)
CREATE TABLE sales (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    sale_reference  NVARCHAR(50)     NOT NULL UNIQUE
                    DEFAULT CONCAT('SAL-', FORMAT(GETUTCDATE(),'yyyyMMdd'), '-', CAST(NEWID() AS NVARCHAR(8))),
    processed_by    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    total_amount    DECIMAL(10,2)    NOT NULL DEFAULT 0,
    notes           NVARCHAR(500)    NULL,
    sale_date       DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- جدول تفاصيل المبيعات (بنود الفاتورة)
CREATE TABLE sale_items (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    sale_id             INT           NOT NULL REFERENCES sales(id),
    product_id          INT           NOT NULL REFERENCES products(id),
    quantity            INT           NOT NULL CHECK (quantity > 0),
    unit_price_at_sale  DECIMAL(10,2) NOT NULL,
    subtotal            AS (quantity * unit_price_at_sale) PERSISTED
);

-- جدول حركات المخزون (Audit Log)
CREATE TABLE stock_movements (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    product_id      INT          NOT NULL REFERENCES products(id),
    movement_type   NVARCHAR(50) NOT NULL
                    CHECK (movement_type IN ('SALE','MANUAL_ADJUSTMENT','INITIAL_STOCK')),
    quantity_change INT          NOT NULL,
    reason          NVARCHAR(255) NULL,
    created_at      DATETIME2    NOT NULL DEFAULT GETUTCDATE()
);

INSERT INTO users (id, email, display_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@test.com',
    'Test Admin',
    'admin'
);

-- Indexes for Performance
CREATE INDEX IX_products_category ON products(category);
CREATE INDEX IX_products_low_stock ON products(quantity_in_stock, low_stock_threshold);
CREATE INDEX IX_sales_date ON sales(sale_date);
CREATE INDEX IX_stock_movements_product ON stock_movements(product_id, created_at);