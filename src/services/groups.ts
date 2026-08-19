import api from './api';
import type { Group, CreateGroupRequest, UpdateGroupRequest } from '@/types';

export const groupService = {
  async getAll(): Promise<Group[]> {
    const { data } = await api.get<Group[]>('/api/groups');
    return data;
  },

  async getById(id: number): Promise<Group> {
    const { data } = await api.get<Group>(`/api/groups/${id}`);
    return data;
  },

  async create(request: CreateGroupRequest): Promise<Group> {
    const { data } = await api.post<Group>('/api/groups', request);
    return data;
  },

  async update(id: number, request: UpdateGroupRequest): Promise<void> {
    await api.put(`/api/groups/${id}`, request);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/groups/${id}`);
  },
};
