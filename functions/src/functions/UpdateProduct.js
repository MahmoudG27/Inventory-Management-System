const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.http('UpdateProduct', {
    methods: ['PUT'],
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

            const body = await request.json();
            const { name, category, unit_price, quantity_in_stock, low_stock_threshold } = body;

            // لازم يبعت حاجة واحدة على الأقل
            if (!name && !category && unit_price === undefined && quantity_in_stock === undefined && low_stock_threshold === undefined) {
                return {
                    status: 400,
                    body: JSON.stringify({ success: false, message: 'No fields to update' })
                };
            }

            const pool = await getConnection();

            // تأكد إن المنتج موجود الأول
            const checkReq = pool.request();
            checkReq.input('id', sql.Int, parseInt(id));
            const check = await checkReq.query('SELECT id FROM products WHERE id = @id');

            if (check.recordset.length === 0) {
                return {
                    status: 404,
                    body: JSON.stringify({ success: false, message: 'Product not found' })
                };
            }

            // بنبني الـ query ديناميكياً — بس الحقول اللي اتبعتت
            const updateReq = pool.request();
            updateReq.input('id', sql.Int, parseInt(id));

            let setClauses = [];

            if (name) {
                setClauses.push('name = @name');
                updateReq.input('name', sql.NVarChar(255), name);
            }
            if (category) {
                setClauses.push('category = @category');
                updateReq.input('category', sql.NVarChar(100), category);
            }
            if (unit_price !== undefined) {
                setClauses.push('unit_price = @unit_price');
                updateReq.input('unit_price', sql.Decimal(10,2), unit_price);
            }
            if (quantity_in_stock !== undefined) {
                setClauses.push('quantity_in_stock = @quantity_in_stock');
                updateReq.input('quantity_in_stock', sql.Int, quantity_in_stock);
            }
            if (low_stock_threshold !== undefined) {
                setClauses.push('low_stock_threshold = @low_stock_threshold');
                updateReq.input('low_stock_threshold', sql.Int, low_stock_threshold);
            }

            setClauses.push('updated_at = GETUTCDATE()');

            const result = await updateReq.query(`
                UPDATE products
                SET ${setClauses.join(', ')}
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Product updated successfully',
                    data: result.recordset[0]
                })
            };

        } catch (error) {
            context.error('UpdateProduct error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});