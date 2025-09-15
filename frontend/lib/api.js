import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
};

// Notes API
export const notesAPI = {
  getNotes: () => api.get('/api/notes'),
  getNote: (id) => api.get(`/api/notes/${id}`),
  createNote: (title, content) => api.post('/api/notes', { title, content }),
  updateNote: (id, title, content) => api.put(`/api/notes/${id}`, { title, content }),
  deleteNote: (id) => api.delete(`/api/notes/${id}`),
};

// Tenant API
export const tenantAPI = {
  getTenant: (slug) => api.get(`/api/tenants/${slug}`),
  upgradeTenant: (slug) => api.post(`/api/tenants/${slug}/upgrade`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
