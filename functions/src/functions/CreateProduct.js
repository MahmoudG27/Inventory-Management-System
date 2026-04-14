const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.http('CreateProduct', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'products',
    handler: async (request, context) => {

        try {
            const body = await request.json();

            // Validation
            const { sku, name, category, unit_price, quantity_in_stock, low_stock_threshold } = body;

            if (!sku || !name || !category || unit_price === undefined) {
                return {
                    status: 400,
                    body: JSON.stringify({
                        success: false,
                        message: 'Missing required fields: sku, name, category, unit_price'
                    })
                };
            }

            const pool = await getConnection();
            const req = pool.request();

            req.input('sku',                 sql.NVarChar(50),  sku);
            req.input('name',                sql.NVarChar(255), name);
            req.input('category',            sql.NVarChar(100), category);
            req.input('unit_price',          sql.Decimal(10,2), unit_price);
            req.input('quantity_in_stock',   sql.Int,           quantity_in_stock || 0);
            req.input('low_stock_threshold', sql.Int,           low_stock_threshold || 5);
            req.input('created_by',          sql.UniqueIdentifier, '00000000-0000-0000-0000-000000000001'); // placeholder قبل الـ Auth

            const result = await req.query(`
                INSERT INTO products 
                    (sku, name, category, unit_price, quantity_in_stock, low_stock_threshold, created_by)
                OUTPUT INSERTED.*
                VALUES 
                    (@sku, @name, @category, @unit_price, @quantity_in_stock, @low_stock_threshold, @created_by)
            `);
            context.log(`PRODUCT_CREATED: sku=${sku} name=${name} category=${category}`);

            return {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Product created successfully',
                    data: result.recordset[0]
                })
            };

        } catch (error) {
            context.error('CreateProduct error:', error);

            if (error.number === 2627) {
                return {
                    status: 409,
                    body: JSON.stringify({ success: false, message: 'SKU already exists' })
                };
            }

            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});