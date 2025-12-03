import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'candidate' | 'employer';
    companyName?: string;
    companyAddress?: string;
    contactNo?: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
