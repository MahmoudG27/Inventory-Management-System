import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    marginRight: '20px',
    textDecoration: 'none',
    color: location.pathname.startsWith(path) ? '#0078d4' : '#333',
    fontWeight: location.pathname.startsWith(path) ? '600' : '400'
  });

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span style={{ fontWeight: '700', fontSize: '18px', marginRight: '32px' }}>
        📦 Inventory System
      </span>
      <Link to="/products" style={linkStyle('/products')}>Products</Link>
      <Link to="/sales"    style={linkStyle('/sales')}>Sales</Link>
    </nav>
  );
}

export default Navbar;