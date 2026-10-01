// services/authService.js
import api from './api';

export const authService = {
  // Login
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout
  async logout(refreshToken) {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Obter perfil do usuário
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Alterar password
  async changePassword(data) {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
};