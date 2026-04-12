const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.http('GetProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'products',
    handler: async (request, context) => {

        try {
            const pool = await getConnection();

            // فلترة اختيارية بالـ category
            const category = request.query.get('category');

            let query = `
                SELECT 
                    id, sku, name, category,
                    unit_price, quantity_in_stock,
                    low_stock_threshold, image_url,
                    created_at
                FROM products
                WHERE 1=1
            `;

            const request_sql = pool.request();

            if (category) {
                query += ` AND category = @category`;
                request_sql.input('category', sql.NVarChar, category);
            }

            query += ` ORDER BY name ASC`;

            const result = await request_sql.query(query);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    count: result.recordset.length,
                    data: result.recordset
                })
            };

        } catch (error) {
            context.error('GetProducts error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});