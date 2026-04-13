import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Sales from './pages/Sales';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <AuthenticatedTemplate>
                <Navbar />
                <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
                    <Routes>
                        <Route path="/"             element={<Navigate to="/products" />} />
                        <Route path="/products"     element={<Products />} />
                        <Route path="/products/add" element={<AddProduct />} />
                        <Route path="/sales"        element={<Sales />} />
                    </Routes>
                </div>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <Login />
            </UnauthenticatedTemplate>
        </BrowserRouter>
    );
}

export default App;