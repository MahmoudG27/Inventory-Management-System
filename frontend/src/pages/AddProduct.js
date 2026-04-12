import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../api';

function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sku: '', name: '', category: '',
    unit_price: '', quantity_in_stock: '', low_stock_threshold: '5'
  });
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createProduct({
        ...form,
        unit_price:          parseFloat(form.unit_price),
        quantity_in_stock:   parseInt(form.quantity_in_stock),
        low_stock_threshold: parseInt(form.low_stock_threshold)
      });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2>Add New Product</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {[
          { label: 'SKU',             name: 'sku',                type: 'text' },
          { label: 'Name',            name: 'name',               type: 'text' },
          { label: 'Category',        name: 'category',           type: 'text' },
          { label: 'Price',           name: 'unit_price',         type: 'number' },
          { label: 'Initial Stock',   name: 'quantity_in_stock',  type: 'number' },
          { label: 'Low Stock Alert', name: 'low_stock_threshold',type: 'number' }
        ].map(({ label, name, type }) => (
          <div key={name} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>
            <input
              type={type} name={name}
              value={form[name]} onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={loading}
            style={{ background: '#0078d4', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')}
            style={{ background: '#eee', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;