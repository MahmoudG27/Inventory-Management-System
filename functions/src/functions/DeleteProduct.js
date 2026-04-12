const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.http('DeleteProduct', {
    methods: ['DELETE'],
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

            // تأكد إن المنتج موجود
            const checkReq = pool.request();
            checkReq.input('id', sql.Int, parseInt(id));
            const check = await checkReq.query('SELECT id, name FROM products WHERE id = @id');

            if (check.recordset.length === 0) {
                return {
                    status: 404,
                    body: JSON.stringify({ success: false, message: 'Product not found' })
                };
            }

            // تأكد إن المنتج مش موجود في sales قبل الحذف
            const salesCheckReq = pool.request();
            salesCheckReq.input('id', sql.Int, parseInt(id));
            const salesCheck = await salesCheckReq.query(`
                SELECT COUNT(*) AS sale_count 
                FROM sale_items 
                WHERE product_id = @id
            `);

            if (salesCheck.recordset[0].sale_count > 0) {
                return {
                    status: 409,
                    body: JSON.stringify({
                        success: false,
                        message: 'Cannot delete product with existing sales history'
                    })
                };
            }

            // احذف الـ stock_movements الأول، بعدين المنتج
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                const delMovReq = new sql.Request(transaction);
                delMovReq.input('id', sql.Int, parseInt(id));
                await delMovReq.query('DELETE FROM stock_movements WHERE product_id = @id');

                const delReq = new sql.Request(transaction);
                delReq.input('id', sql.Int, parseInt(id));
                await delReq.query('DELETE FROM products WHERE id = @id');

                await transaction.commit();

                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: true,
                        message: `Product "${check.recordset[0].name}" deleted successfully`
                    })
                };

            } catch (txError) {
                await transaction.rollback();
                throw txError;
            }

        } catch (error) {
            context.error('DeleteProduct error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});