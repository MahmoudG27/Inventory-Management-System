import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

function Login() {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f5f5f5'
        }}>
            <div style={{
                background: '#fff',
                padding: '48px',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <h1 style={{ margin: '0 0 8px', fontSize: '24px' }}>Inventory System</h1>
                <p style={{ color: '#666', marginBottom: '32px' }}>
                    Sign in with your Microsoft account to continue
                </p>
                <button
                    onClick={handleLogin}
                    style={{
                        background: '#0078d4',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    Sign in with Microsoft
                </button>
            </div>
        </div>
    );
}

export default Login;