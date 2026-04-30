import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me')
};

export const streamsService = {
  getActiveStreams: () => api.get('/streams'),
  getStreamById: (id) => api.get(`/streams/${id}`),
  createStream: (title, description) =>
    api.post('/streams', { title, description }),
  updateStream: (id, data) =>
    api.put(`/streams/${id}`, data),
  endStream: (id) => api.post(`/streams/${id}/end`),
  getStreamAnalytics: (id) => api.get(`/streams/${id}/analytics`)
};

export const usersService = {
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  getUserStreams: (id) => api.get(`/users/${id}/streams`),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.delete(`/users/${id}/follow`)
};

export const giftsService = {
  sendGift: (streamId, giftType, amount) =>
    api.post('/gifts', { stream_id: streamId, gift_type: giftType, amount }),
  getStreamGifts: (streamId) => api.get(`/gifts/stream/${streamId}`),
  getUserGiftHistory: (userId) => api.get(`/gifts/user/${userId}/history`)
};

export const paymentsService = {
  createPaymentIntent: (amount, currency) =>
    api.post('/payments/create-intent', { amount, currency }),
  confirmPayment: (paymentIntentId) =>
    api.post('/payments/confirm', { paymentIntentId }),
  getPaymentHistory: (userId) => api.get(`/payments/history/${userId}`)
};

export const analyticsService = {
  getStreamAnalytics: (streamId) => api.get(`/analytics/stream/${streamId}`),
  getUserAnalytics: (userId) => api.get(`/analytics/user/${userId}`),
  getPlatformStats: () => api.get('/analytics/admin/stats')
};

export default api;
