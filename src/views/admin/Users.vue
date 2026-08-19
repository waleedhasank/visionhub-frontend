<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/users';
import { useGroupStore } from '@/stores/groups';

const userStore = useUserStore();
const groupStore = useGroupStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const selectedUser = ref<any>(null);
const generatedPassword = ref('');

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  userType: 'SalesPerson',
  groupIds: [] as number[],
});

onMounted(async () => {
  await userStore.fetchAll();
  await groupStore.fetchAll();
});

async function handleCreate() {
  const response = await userStore.create(formData.value);
  if (response) {
    generatedPassword.value = response.generatedPassword;
    alert(`User created! Password: ${response.generatedPassword}\n\nCopy this password - it won't be shown again.`);
    showCreateModal.value = false;
    resetForm();
  }
}

async function handleDelete(user: any) {
  if (confirm(`Delete user ${user.firstName} ${user.lastName}?`)) {
    await userStore.remove(user.id);
  }
}

async function handleResetPassword(user: any) {
  const newPassword = await userStore.resetPassword(user.id);
  if (newPassword) {
    alert(`Password reset! New password: ${newPassword}\n\nCopy this password - it won't be shown again.`);
  }
}

function resetForm() {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    userType: 'SalesPerson',
    groupIds: [],
  };
}
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h1>User Management</h1>
      <button @click="showCreateModal = true" class="btn-primary">Create User</button>
    </div>

    <div v-if="userStore.loading" class="loading">Loading...</div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Groups</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userStore.users" :key="user.id">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.userType }}</td>
            <td>{{ user.groups.join(', ') }}</td>
            <td>
              <button @click="handleResetPassword(user)" class="btn-sm" v-if="!user.isSuperAdmin">
                Reset Password
              </button>
              <button @click="handleDelete(user)" class="btn-sm btn-danger" v-if="!user.isSuperAdmin">
                Delete
              </button>
              <span v-if="user.isSuperAdmin" class="badge">Super Admin</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal (simplified) -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>Create User</h2>
        <form @submit.prevent="handleCreate">
          <input v-model="formData.firstName" placeholder="First Name" required />
          <input v-model="formData.lastName" placeholder="Last Name" required />
          <input v-model="formData.email" type="email" placeholder="Email" required />
          <select v-model="formData.userType">
            <option value="Admin">Admin</option>
            <option value="SalesPerson">Sales Person</option>
          </select>
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
.users-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  color: #2d3748;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-sm {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.badge {
  background: #f6e05e;
  color: #744210;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #718096;
}
</style>
