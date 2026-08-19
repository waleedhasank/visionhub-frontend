import api from './api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/auth/login', credentials);
    return data;
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await api.post('/api/auth/change-password', request);
  },

  async getCurrentUser() {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};
