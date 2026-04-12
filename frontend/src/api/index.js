import axios from 'axios';

const API_BASE = 'https://inventory-sys.azurewebsites.net/api';

const api = axios.create({ baseURL: API_BASE });

// Products
export const getProducts  = ()       => api.get('/products');
export const getProductById = (id)   => api.get(`/products/${id}`);
export const createProduct = (data)  => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id)    => api.delete(`/products/${id}`);

// Sales
export const getSales  = ()      => api.get('/sales');
export const createSale = (data) => api.post('/sales', data);