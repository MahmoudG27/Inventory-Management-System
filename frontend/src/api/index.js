import axios from 'axios';
import { msalInstance } from './msalInstance';
import { loginRequest } from '../authConfig';

const API_BASE = 'https://inventory-sys.azurewebsites.net/api';

const api = axios.create({ baseURL: API_BASE });

// قبل كل request، جيب الـ token وحطه في الـ header
api.interceptors.request.use(async (config) => {
    try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0]
            });
            config.headers.Authorization = `Bearer ${response.accessToken}`;
        }
    } catch (error) {
        console.error('Token acquisition failed:', error);
    }
    return config;
});

export const getProducts    = ()          => api.get('/products');
export const getProductById = (id)        => api.get(`/products/${id}`);
export const createProduct  = (data)      => api.post('/products', data);
export const updateProduct  = (id, data)  => api.put(`/products/${id}`, data);
export const deleteProduct  = (id)        => api.delete(`/products/${id}`);
export const getSales       = ()          => api.get('/sales');
export const createSale     = (data)      => api.post('/sales', data);