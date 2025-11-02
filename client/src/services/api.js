import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Admin API
export const adminAPI = {
  getAuthors: () => api.get('/admin/authors'),
  addAuthor: (authorData) => api.post('/admin/authors', authorData),
  updateAuthor: (id, authorData) => api.put(`/admin/authors/${id}`, authorData),
  deleteAuthor: (id) => api.delete(`/admin/authors/${id}`),
  getAllContent: () => api.get('/admin/content'),
  assignEditors: (contentId, editorIds) =>
    api.put(`/admin/content/${contentId}/editors`, { editorIds }),
};

// Content API (public)
export const contentAPI = {
  getAllPublished: () => api.get('/content'),
  getBySlug: (slug) => api.get(`/content/${slug}`),
};

// Author API
export const authorAPI = {
  getMyContent: () => api.get('/author/my-content'),
  createContent: (contentData) => api.post('/author/content', contentData),
  updateContent: (id, contentData) => api.put(`/author/content/${id}`, contentData),
  deleteContent: (id) => api.delete(`/author/content/${id}`),
  uploadMedia: (file) => api.post('/author/upload', file),
};

export default api;

