import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Handle 401 errors (unauthorized) - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('provider');
      if (window.location.pathname !== '/provider/login') {
        window.location.href = '/provider/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Provider login
  loginProvider: async (email, password) => {
    const response = await api.post('/auth/provider/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('provider', JSON.stringify(response.data.provider));
    }
    return response.data;
  },

  // Admin login
  loginAdmin: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('provider');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get current provider
  getProvider: () => {
    const providerStr = localStorage.getItem('provider');
    return providerStr ? JSON.parse(providerStr) : null;
  },
};

// Provider API
export const providerAPI = {
  // Get current provider profile
  getProfile: () => api.get('/providers/me'),

  // Update profile
  updateProfile: (data) => api.put('/providers/me', data),

  // Get provider's services
  getMyServices: () => api.get('/providers/me/services'),

  // Get provider's events
  getMyEvents: () => api.get('/providers/me/events'),
};

// Services API
export const servicesAPI = {
  // Get all services
  getServices: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/services?${queryParams.toString()}`);
  },

  // Get single service
  getService: (id) => api.get(`/services/${id}`),

  // Create service
  createService: (data) => api.post('/services', data),

  // Update service
  updateService: (id, data) => api.put(`/services/${id}`, data),

  // Delete service
  deleteService: (id) => api.delete(`/services/${id}`),
};

// Events API
export const eventsAPI = {
  // Get all events
  getEvents: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/events?${queryParams.toString()}`);
  },

  // Get single event
  getEvent: (id) => api.get(`/events/${id}`),

  // Create event
  createEvent: (data) => api.post('/events', data),

  // Update event
  updateEvent: (id, data) => api.put(`/events/${id}`, data),

  // Delete event
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// Admin API
export const adminAPI = {
  // Get all providers
  getProviders: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    // Use admin token
    const adminToken = localStorage.getItem('adminToken');
    return api.get(`/admin/providers?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },

  // Get single provider
  getProvider: (id) => {
    const adminToken = localStorage.getItem('adminToken');
    return api.get(`/admin/providers/${id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },

  // Create provider
  createProvider: (data) => {
    const adminToken = localStorage.getItem('adminToken');
    return api.post('/admin/providers', data, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },

  // Update provider
  updateProvider: (id, data) => {
    const adminToken = localStorage.getItem('adminToken');
    return api.put(`/admin/providers/${id}`, data, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },

  // Delete provider
  deleteProvider: (id) => {
    const adminToken = localStorage.getItem('adminToken');
    return api.delete(`/admin/providers/${id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },

  // Get admin profile
  getProfile: () => {
    const adminToken = localStorage.getItem('adminToken');
    return api.get('/admin/me', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },
};

export default api;

