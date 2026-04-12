const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.http('GetProductById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'products/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params.id;

            if (!id || isNaN(id)) {
                return {
                    status: 400,
                    body: JSON.stringify({ success: false, message: 'Invalid product ID' })
                };
            }

            const pool = await getConnection();
            const req = pool.request();
            req.input('id', sql.Int, parseInt(id));

            const result = await req.query(`
                SELECT 
                    id, sku, name, category,
                    unit_price, quantity_in_stock,
                    low_stock_threshold, image_url,
                    created_at, updated_at
                FROM products
                WHERE id = @id
            `);

            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    body: JSON.stringify({ success: false, message: 'Product not found' })
                };
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, data: result.recordset[0] })
            };

        } catch (error) {
            context.error('GetProductById error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});