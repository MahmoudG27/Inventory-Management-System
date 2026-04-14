const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.http('GetSales', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'sales',
    handler: async (request, context) => {
        try {
            const pool = await getConnection();
            const req = pool.request();

            const result = await req.query(`
                SELECT 
                    s.id,
                    s.sale_reference,
                    s.total_amount,
                    s.notes,
                    s.sale_date,
                    u.display_name AS processed_by_name,
                    (
                        SELECT 
                            si.quantity,
                            si.unit_price_at_sale,
                            si.subtotal,
                            p.name AS product_name,
                            p.sku
                        FROM sale_items si
                        JOIN products p ON p.id = si.product_id
                        WHERE si.sale_id = s.id
                        FOR JSON PATH
                    ) AS items
                FROM sales s
                JOIN users u ON u.id = s.processed_by
                ORDER BY s.sale_date DESC
            `);

            const sales = result.recordset.map(sale => ({
                ...sale,
                items: sale.items ? JSON.parse(sale.items) : []
            }));

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    count: sales.length,
                    data: sales
                })
            };

        } catch (error) {
            context.error('GetSales error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});