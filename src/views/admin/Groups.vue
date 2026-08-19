<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGroupStore } from '@/stores/groups';

const groupStore = useGroupStore();
const showCreateModal = ref(false);
const groupName = ref('');

onMounted(async () => {
  await groupStore.fetchAll();
});

async function handleCreate() {
  if (!groupName.value) return;
  
  await groupStore.create({ name: groupName.value });
  groupName.value = '';
  showCreateModal.value = false;
}

async function handleDelete(group: any) {
  if (confirm(`Delete group "${group.name}"?`)) {
    await groupStore.remove(group.id);
  }
}
</script>

<template>
  <div class="groups-page">
    <div class="page-header">
      <h1>Group Management</h1>
      <button @click="showCreateModal = true" class="btn-primary">Create Group</button>
    </div>

    <div v-if="groupStore.loading" class="loading">Loading...</div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in groupStore.groups" :key="group.id">
            <td>{{ group.name }}</td>
            <td>{{ new Date(group.createdOn).toLocaleDateString() }}</td>
            <td>
              <button @click="handleDelete(group)" class="btn-sm btn-danger" v-if="group.id > 2">
                Delete
              </button>
              <span v-else class="badge">Default</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>Create Group</h2>
        <form @submit.prevent="handleCreate">
          <input v-model="groupName" placeholder="Group Name" required />
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Create</button>
            <button type="button" @click="showCreateModal = false" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Same styles as Users.vue */
.groups-page { width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h1 { margin: 0; color: #2d3748; }
.table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
th { background: #f7fafc; font-weight: 600; color: #4a5568; }
.btn-primary { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 500; }
.btn-sm { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
.btn-danger { background: #e53e3e; color: white; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; min-width: 400px; }
.modal-content input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-secondary { background: #e2e8f0; color: #2d3748; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; }
.badge { background: #f6e05e; color: #744210; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 500; }
.loading { text-align: center; padding: 2rem; color: #718096; }
</style>
