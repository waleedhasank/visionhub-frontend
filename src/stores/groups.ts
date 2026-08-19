import { defineStore } from 'pinia';
import { ref } from 'vue';
import { groupService } from '@/services/groups';
import type { Group, CreateGroupRequest, UpdateGroupRequest } from '@/types';

export const useGroupStore = defineStore('groups', () => {
  const groups = ref<Group[]>([]);
  const currentGroup = ref<Group | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;

    try {
      groups.value = await groupService.getAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch groups';
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: number) {
    loading.value = true;
    error.value = null;

    try {
      currentGroup.value = await groupService.getById(id);
      return currentGroup.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch group';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(request: CreateGroupRequest) {
    loading.value = true;
    error.value = null;

    try {
      const group = await groupService.create(request);
      await fetchAll(); // Refresh list
      return group;
    } catch (err: any) {
      error.value = err.message || 'Failed to create group';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: number, request: UpdateGroupRequest) {
    loading.value = true;
    error.value = null;

    try {
      await groupService.update(id, request);
      await fetchAll(); // Refresh list
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to update group';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number) {
    loading.value = true;
    error.value = null;

    try {
      await groupService.delete(id);
      await fetchAll(); // Refresh list
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete group';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    groups,
    currentGroup,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
});
