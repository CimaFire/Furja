import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

export default api;
