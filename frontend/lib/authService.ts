import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async register(data: FormData | Record<string, any>): Promise<AuthResponse> {
    const isFormData = data instanceof FormData;
    const response = await api.post('/auth/register', data, {
      headers: isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: any): Promise<User> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<any> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<any> {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
