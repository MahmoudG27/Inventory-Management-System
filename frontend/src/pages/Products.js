import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api';
import axios from 'axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed';
      alert(msg);
    }
  };

  const handleImageUpload = async (productId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await axios.post(
        `https://inventory-sys.azurewebsites.net/api/products/${productId}/image`,
        formData
      );
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <Link to="/products/add">
          <button style={btnStyle('#0078d4')}>+ Add Product</button>
        </Link>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['SKU', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Image', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}><code>{p.sku}</code></td>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.category}</td>
                <td style={tdStyle}>${p.unit_price}</td>
                <td style={tdStyle}>{p.quantity_in_stock}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: p.quantity_in_stock <= p.low_stock_threshold ? '#fde8e8' : '#e8f5e9',
                    color:      p.quantity_in_stock <= p.low_stock_threshold ? '#c62828' : '#2e7d32'
                  }}>
                    {p.quantity_in_stock <= p.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <label style={{ cursor: 'pointer', color: '#0078d4', fontSize: '13px' }}>
                      + Upload
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(p.id, e.target.files[0])}
                      />
                    </label>
                  )}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    style={btnStyle('#e53935')}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 14px', textAlign: 'left', fontWeight: '600' };
const tdStyle = { padding: '10px 14px' };
const btnStyle = (bg) => ({
  background: bg, color: '#fff', border: 'none',
  padding: '7px 16px', borderRadius: '6px', cursor: 'pointer'
});

export default Products;