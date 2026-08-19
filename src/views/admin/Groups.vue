<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGroupStore } from '@/stores/groups';

const groupStore = useGroupStore();
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const showErrorModal = ref(false);
const groupName = ref('');
const groupToDelete = ref<any>(null);
const errorMessage = ref('');

onMounted(async () => {
  await groupStore.fetchAll();
});

async function handleCreate() {
  if (!groupName.value) return;
  
  const group = await groupStore.create({ name: groupName.value });
  if (group) {
    groupName.value = '';
    showCreateModal.value = false;
  } else if (groupStore.error) {
    errorMessage.value = groupStore.error;
    showErrorModal.value = true;
  }
}

function confirmDelete(group: any) {
  groupToDelete.value = group;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!groupToDelete.value) return;
  
  const success = await groupStore.remove(groupToDelete.value.id);
  if (success) {
    showDeleteModal.value = false;
    groupToDelete.value = null;
  } else if (groupStore.error) {
    showDeleteModal.value = false;
    errorMessage.value = groupStore.error;
    showErrorModal.value = true;
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
              <button @click="confirmDelete(group)" class="btn-sm btn-danger" v-if="group.id > 2">
                Delete
              </button>
              <span v-else class="badge">Default</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h2>Create Group</h2>
        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>Group Name *</label>
            <input v-model="groupName" placeholder="Enter group name" required />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Create</button>
            <button type="button" @click="showCreateModal = false" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content delete-modal">
        <div class="modal-icon warning">⚠</div>
        <h2>Confirm Delete</h2>
        <p class="modal-message">
          Are you sure you want to delete the group <strong>"{{ groupToDelete?.name }}"</strong>?
          <br>This action cannot be undone.
        </p>
        <div class="modal-actions centered">
          <button @click="handleDelete" class="btn-danger">Delete</button>
          <button @click="showDeleteModal = false; groupToDelete = null" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal">
      <div class="modal-content error-modal">
        <div class="modal-icon error">✕</div>
        <h2>Error</h2>
        <p class="modal-message">{{ errorMessage }}</p>
        <div class="modal-actions centered">
          <button @click="showErrorModal = false" class="btn-primary">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
.modal-content { background: white; padding: 2rem; border-radius: 12px; min-width: 400px; }
.modal-content h2 { margin: 0 0 1.5rem 0; color: #2d3748; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #4a5568; }
.modal-content input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 4px; box-sizing: border-box; font-size: 1rem; }
.modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.modal-actions.centered { justify-content: center; }
.btn-secondary { background: #e2e8f0; color: #2d3748; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; }
.badge { background: #f6e05e; color: #744210; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 500; }
.loading { text-align: center; padding: 2rem; color: #718096; }

/* Modal Icons */
.delete-modal, .error-modal { text-align: center; }
.modal-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem; }
.modal-icon.warning { background: #fef3c7; color: #92400e; }
.modal-icon.error { background: #fed7d7; color: #c53030; }
.modal-message { color: #4a5568; margin-bottom: 1.5rem; line-height: 1.5; }
</style>
