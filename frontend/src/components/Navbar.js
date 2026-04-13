import { Link, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

function Navbar() {
    const location = useLocation();
    const { instance, accounts } = useMsal();

    const handleLogout = () => {
        instance.logoutRedirect();
    };

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
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '18px', marginRight: '32px' }}>
                    📦 Inventory System
                </span>
                <Link to="/products" style={linkStyle('/products')}>Products</Link>
                <Link to="/sales"    style={linkStyle('/sales')}>Sales</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>
                    {accounts[0]?.name}
                </span>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid #ccc',
                        padding: '6px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Sign out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;