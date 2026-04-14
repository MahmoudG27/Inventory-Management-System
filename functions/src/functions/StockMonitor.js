const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

app.timer('StockMonitor', {
    schedule: '0 0 * * * *',
    handler: async (myTimer, context) => {

        context.log('StockMonitor: checking low stock products...');

        try {
            const pool = await getConnection();
            const req = pool.request();

            const result = await req.query(`
                SELECT id, name, sku, quantity_in_stock, low_stock_threshold
                FROM products
                WHERE quantity_in_stock <= low_stock_threshold
            `);

            if (result.recordset.length === 0) {
                context.log('StockMonitor: all products have sufficient stock.');
                return;
            }

            context.log(`STOCK_CHECK: found ${result.recordset.length} low stock products`);

            for (const product of result.recordset) {
                await triggerLogicApp({
                    productName:  product.name,
                    sku:          product.sku,
                    currentStock: product.quantity_in_stock,
                    threshold:    product.low_stock_threshold
                });
                context.log(`Alert sent for: ${product.name}`);
            }

        } catch (error) {
            context.error('StockMonitor error:', error);
        }
    }
});

async function triggerLogicApp(data) {
    const logicAppUrl = process.env.LOGIC_APP_URL;

    const response = await fetch(logicAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Logic App trigger failed: ${response.status}`);
    }
}