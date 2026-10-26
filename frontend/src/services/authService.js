import api from './api';

export const authService = {
  register: (data) => api.post('/api/auth/register/', data),

  login: async (credentials) => {
    const res = await api.post('/api/auth/login/', credentials);
    const { access, refresh, user } = res.data;
    localStorage.setItem('lms_access_token', access);
    localStorage.setItem('lms_refresh_token', refresh);
    localStorage.setItem('lms_user', JSON.stringify(user));
    return res.data;
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('lms_refresh_token');
      if (refresh) await api.post('/api/auth/logout/', { refresh });
    } catch (_) {
      // ignore errors during logout
    } finally {
      localStorage.removeItem('lms_access_token');
      localStorage.removeItem('lms_refresh_token');
      localStorage.removeItem('lms_user');
    }
  },

  forgotPassword: (email) =>
    api.post('/api/auth/forgot-password/', { email }),

  resetPassword: (data) =>
    api.post('/api/auth/reset-password/', data),

  getProfile: () => api.get('/api/users/profile/'),

  updateProfile: (data) => api.patch('/api/users/profile/', data),

  getCurrentUser: () => {
    const raw = localStorage.getItem('lms_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('lms_access_token'),
};
