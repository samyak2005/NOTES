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
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Notes API
export const notesAPI = {
  getNotes: () => api.get('/notes'),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: (title, content) => api.post('/notes', { title, content }),
  updateNote: (id, title, content) => api.put(`/notes/${id}`, { title, content }),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// Tenant API
export const tenantAPI = {
  getTenant: (slug) => api.get(`/tenants/${slug}`),
  upgradeTenant: (slug) => api.post(`/tenants/${slug}/upgrade`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
