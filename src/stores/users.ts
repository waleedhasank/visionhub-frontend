import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userService } from '@/services/users';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types';

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;

    try {
      users.value = await userService.getAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users';
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: number) {
    loading.value = true;
    error.value = null;

    try {
      currentUser.value = await userService.getById(id);
      return currentUser.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(request: CreateUserRequest) {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.create(request);
      await fetchAll(); // Refresh list
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to create user';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: number, request: UpdateUserRequest) {
    loading.value = true;
    error.value = null;

    try {
      await userService.update(id, request);
      await fetchAll(); // Refresh list
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to update user';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number) {
    loading.value = true;
    error.value = null;

    try {
      await userService.delete(id);
      await fetchAll(); // Refresh list
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(id: number) {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.resetPassword(id);
      return response.generatedPassword;
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password';
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    currentUser,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    resetPassword,
  };
});
