const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const { getConnection, sql } = require('../database');

app.http('UploadProductImage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'products/{id}/image',
    handler: async (request, context) => {
        try {
            const productId = request.params.id;

            const pool = await getConnection();
            const checkReq = pool.request();
            checkReq.input('id', sql.Int, parseInt(productId));
            const check = await checkReq.query('SELECT id FROM products WHERE id = @id');

            if (check.recordset.length === 0) {
                return {
                    status: 404,
                    body: JSON.stringify({ success: false, message: 'Product not found' })
                };
            }

            const formData = await request.formData();
            const imageFile = formData.get('image');

            if (!imageFile) {
                return {
                    status: 400,
                    body: JSON.stringify({ success: false, message: 'No image provided' })
                };
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(imageFile.type)) {
                return {
                    status: 400,
                    body: JSON.stringify({ success: false, message: 'Only JPEG, PNG and WebP allowed' })
                };
            }

            const blobServiceClient = BlobServiceClient.fromConnectionString(
                process.env.STORAGE_CONNECTION_STRING
            );
            const containerClient = blobServiceClient.getContainerClient('product-images');

            const extension = imageFile.name.split('.').pop();
            const blobName = `product-${productId}-${Date.now()}.${extension}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: { blobContentType: imageFile.type }
            });

            const imageUrl = blockBlobClient.url;

            const updateReq = pool.request();
            updateReq.input('id',        sql.Int,           parseInt(productId));
            updateReq.input('image_url', sql.NVarChar(500), imageUrl);
            await updateReq.query(`
                UPDATE products 
                SET image_url = @image_url, updated_at = GETUTCDATE()
                WHERE id = @id
            `);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'Image uploaded successfully',
                    data: { image_url: imageUrl }
                })
            };

        } catch (error) {
            context.error('UploadProductImage error:', error);
            return {
                status: 500,
                body: JSON.stringify({ success: false, message: 'Internal server error' })
            };
        }
    }
});