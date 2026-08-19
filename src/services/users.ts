import api from './api';
import type {
  User,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
} from '@/types';

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/api/users');
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(`/api/users/${id}`);
    return data;
  },

  async create(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { data } = await api.post<CreateUserResponse>('/api/users', request);
    return data;
  },

  async update(id: number, request: UpdateUserRequest): Promise<void> {
    await api.put(`/api/users/${id}`, request);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  async resetPassword(id: number): Promise<{ generatedPassword: string }> {
    const { data } = await api.post<{ generatedPassword: string }>(
      `/api/users/${id}/reset-password`
    );
    return data;
  },
};
