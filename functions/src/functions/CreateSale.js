const { app } = require('@azure/functions');
const { getConnection, sql } = require('../database');

function generateSaleReference() {
    const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const random = Math.random().toString(36).substring(2,8).toUpperCase();
    return `SAL-${date}-${random}`;
}

app.http('CreateSale', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'sales',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { items, notes } = body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return {
                    status: 400,
                    body: JSON.stringify({ success: false, message: 'items array is required' })
                };
            }

            const pool = await getConnection();
            const transaction = new sql.Transaction(pool);

            try {
                await transaction.begin();

                // 1 — تأكد من الـ stock
                for (const item of items) {
                    const checkReq = new sql.Request(transaction);
                    checkReq.input('product_id', sql.Int, item.product_id);
                    const check = await checkReq.query(`
                        SELECT id, name, quantity_in_stock, unit_price
                        FROM products WHERE id = @product_id
                    `);

                    if (check.recordset.length === 0) {
                        await transaction.rollback();
                        return {
                            status: 404,
                            body: JSON.stringify({ success: false, message: `Product ID ${item.product_id} not found` })
                        };
                    }

                    const product = check.recordset[0];
                    if (product.quantity_in_stock < item.quantity) {
                        await transaction.rollback();
                        return {
                            status: 400,
                            body: JSON.stringify({
                                success: false,
                                message: `Insufficient stock for "${product.name}". Available: ${product.quantity_in_stock}`
                            })
                        };
                    }
                }

                // 2 — عمل الـ Sale record مع reference من JS
                const saleRef = generateSaleReference(); // ← هنا
                const saleReq = new sql.Request(transaction);
                saleReq.input('processed_by',   sql.UniqueIdentifier, '00000000-0000-0000-0000-000000000001');
                saleReq.input('notes',          sql.NVarChar(500),    notes || null);
                saleReq.input('sale_reference', sql.NVarChar(50),     saleRef); // ← هنا

                const saleResult = await saleReq.query(`
                    INSERT INTO sales (processed_by, notes, sale_reference)
                    OUTPUT INSERTED.id, INSERTED.sale_reference
                    VALUES (@processed_by, @notes, @sale_reference)
                `);

                const saleId        = saleResult.recordset[0].id;
                const saleReference = saleResult.recordset[0].sale_reference;

                // 3 — sale_items + stock update
                for (const item of items) {
                    const priceReq = new sql.Request(transaction);
                    priceReq.input('product_id', sql.Int, item.product_id);
                    const priceResult = await priceReq.query(`
                        SELECT unit_price FROM products WHERE id = @product_id
                    `);
                    const unitPrice = priceResult.recordset[0].unit_price;

                    const itemReq = new sql.Request(transaction);
                    itemReq.input('sale_id',            sql.Int,           saleId);
                    itemReq.input('product_id',         sql.Int,           item.product_id);
                    itemReq.input('quantity',            sql.Int,           item.quantity);
                    itemReq.input('unit_price_at_sale', sql.Decimal(10,2), unitPrice);
                    await itemReq.query(`
                        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price_at_sale)
                        VALUES (@sale_id, @product_id, @quantity, @unit_price_at_sale)
                    `);

                    const stockReq = new sql.Request(transaction);
                    stockReq.input('quantity',   sql.Int, item.quantity);
                    stockReq.input('product_id', sql.Int, item.product_id);
                    await stockReq.query(`
                        UPDATE products
                        SET quantity_in_stock = quantity_in_stock - @quantity,
                            updated_at = GETUTCDATE()
                        WHERE id = @product_id
                    `);

                    const movReq = new sql.Request(transaction);
                    movReq.input('product_id',      sql.Int,           item.product_id);
                    movReq.input('quantity_change', sql.Int,           -item.quantity);
                    movReq.input('reason',          sql.NVarChar(255), `Sale ref: ${saleReference}`);
                    await movReq.query(`
                        INSERT INTO stock_movements (product_id, movement_type, quantity_change, reason)
                        VALUES (@product_id, 'SALE', @quantity_change, @reason)
                    `);
                }

                // 4 — حدّث الـ total_amount
                const totalReq = new sql.Request(transaction);
                totalReq.input('sale_id', sql.Int, saleId);
                await totalReq.query(`
                    UPDATE sales
                    SET total_amount = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = @sale_id)
                    WHERE id = @sale_id
                `);

                await transaction.commit();

                return {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: true,
                        message: 'Sale created successfully',
                        data: { sale_id: saleId, sale_reference: saleReference }
                    })
                };

            } catch (txError) {
                await transaction.rollback();
                throw txError;
            }

        } catch (error) {
            context.error('CreateSale error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});