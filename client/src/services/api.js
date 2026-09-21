import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('skilldesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skilldesk_token');
      localStorage.removeItem('skilldesk_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: (id) => API.get(`/users/${id}`),
  updateProfile: (data) => API.put('/users/profile', data),
  getFreelancers: (params) => API.get('/users/freelancers', { params }),
};

// Service API
export const serviceAPI = {
  getServices: (params) => API.get('/services', { params }),
  getServiceById: (id) => API.get(`/services/${id}`),
  createService: (data) => API.post('/services', data),
  updateService: (id, data) => API.put(`/services/${id}`, data),
  deleteService: (id) => API.delete(`/services/${id}`),
  getMyServices: () => API.get('/services/my-services'),
  getFeatured: () => API.get('/services/featured'),
};

// Order API
export const orderAPI = {
  createOrder: (data) => API.post('/orders', data),
  getOrders: (params) => API.get('/orders', { params }),
  getOrderById: (id) => API.get(`/orders/${id}`),
  acceptOrder: (id) => API.put(`/orders/${id}/accept`),
  rejectOrder: (id) => API.put(`/orders/${id}/reject`),
  startOrder: (id) => API.put(`/orders/${id}/start`),
  deliverOrder: (id, data) => API.put(`/orders/${id}/deliver`, data),
  requestRevision: (id, data) => API.put(`/orders/${id}/revision`, data),
  completeOrder: (id) => API.put(`/orders/${id}/complete`),
  cancelOrder: (id) => API.put(`/orders/${id}/cancel`),
  getStats: () => API.get('/orders/stats'),
};

// Review API
export const reviewAPI = {
  createReview: (data) => API.post('/reviews', data),
  getServiceReviews: (serviceId, params) => API.get(`/reviews/service/${serviceId}`, { params }),
  getFreelancerReviews: (freelancerId, params) => API.get(`/reviews/freelancer/${freelancerId}`, { params }),
};

// Message API
export const messageAPI = {
  getConversations: () => API.get('/messages/conversations'),
  createConversation: (userId) => API.post('/messages/conversations', { userId }),
  getMessages: (conversationId, params) => API.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (conversationId, data) => API.post(`/messages/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId) => API.put(`/messages/conversations/${conversationId}/read`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params) => API.get('/notifications', { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

// Category API
export const categoryAPI = {
  getCategories: () => API.get('/categories'),
};

// Upload API
export const uploadAPI = {
  getAuthParams: () => API.get('/upload/auth'),
};

export default API;
