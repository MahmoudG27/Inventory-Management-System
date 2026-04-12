import { useEffect, useState } from 'react';
import { getSales, getProducts, createSale } from '../api';

function Sales() {
  const [sales,    setSales]    = useState([]);
  const [products, setProducts] = useState([]);
  const [items,    setItems]    = useState([{ product_id: '', quantity: 1 }]);
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  useEffect(() => {
    getProducts().then(r => setProducts(r.data.data));
    getSales().then(r => setSales(r.data.data));
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      const res = await createSale({
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
        notes
      });
      setSuccess(`Sale created: ${res.data.data.sale_reference}`);
      setItems([{ product_id: '', quantity: 1 }]);
      setNotes('');
      getSales().then(r => setSales(r.data.data));
      getProducts().then(r => setProducts(r.data.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sales</h2>

      {/* New Sale Form */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0 }}>New Sale</h3>
        {error   && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
              <select
                value={item.product_id}
                onChange={e => updateItem(i, 'product_id', e.target.value)}
                required
                style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.quantity_in_stock})
                  </option>
                ))}
              </select>
              <input
                type="number" min="1"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                required
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)}
                  style={{ background: '#e53935', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addItem}
            style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '12px' }}>
            + Add Item
          </button>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text" placeholder="Notes (optional)"
              value={notes} onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" disabled={loading}
            style={{ background: '#0078d4', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Record Sale'}
          </button>
        </form>
      </div>

      {/* Sales History */}
      <h3>Sales History</h3>
      {sales.length === 0 ? <p>No sales yet.</p> : sales.map(sale => (
        <div key={sale.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{sale.sale_reference}</strong>
            <span style={{ color: '#0078d4', fontWeight: '600' }}>${sale.total_amount}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {new Date(sale.sale_date).toLocaleString()} · {sale.processed_by_name}
          </div>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '14px' }}>
            {sale.items.map((item, i) => (
              <li key={i}>{item.product_name} × {item.quantity} = ${item.subtotal}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Sales;