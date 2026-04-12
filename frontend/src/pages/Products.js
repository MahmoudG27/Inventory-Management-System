import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api';

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
              {['SKU', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
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