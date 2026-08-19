<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/users';
import { useGroupStore } from '@/stores/groups';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const userStore = useUserStore();
const groupStore = useGroupStore();
const authStore = useAuthStore();
const router = useRouter();

const showCreateModal = ref(false);
const showPasswordModal = ref(false);
const showDeleteModal = ref(false);
const showErrorModal = ref(false);

const generatedPassword = ref('');
const errorMessage = ref('');
const userToDelete = ref<any>(null);
const emailUsername = ref('');
const emailError = ref('');
const checkingEmail = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  userType: 'SalesPerson' as 'Admin' | 'SalesPerson',
  groupIds: [] as number[],
});

const fullEmail = computed(() => `${emailUsername.value}@visionhub.com`);

const canSubmit = computed(() => {
  if (!formData.value.firstName || !formData.value.lastName || !emailUsername.value) {
    return false;
  }
  if (emailError.value) return false;
  if (formData.value.userType === 'SalesPerson' && formData.value.groupIds.length === 0) {
    return false;
  }
  return true;
});

watch(emailUsername, async (newVal) => {
  if (!newVal) {
    emailError.value = '';
    return;
  }
  
  emailError.value = '';
  checkingEmail.value = true;
  
  try {
    const { data } = await api.get(`/api/users/check-email?email=${encodeURIComponent(fullEmail.value)}`);
    if (data.exists) {
      emailError.value = 'This email is already in use';
    }
  } catch {
    // Endpoint might not exist yet, skip check
  } finally {
    checkingEmail.value = false;
  }
});

watch(() => formData.value.userType, (newType) => {
  if (newType === 'Admin') {
    formData.value.groupIds = [];
  }
});

onMounted(async () => {
  await userStore.fetchAll();
  await groupStore.fetchAll();
});

async function handleCreate() {
  if (!canSubmit.value) {
    if (formData.value.userType === 'SalesPerson' && formData.value.groupIds.length === 0) {
      errorMessage.value = 'Sales person must be assigned to at least one group';
      showErrorModal.value = true;
      return;
    }
    return;
  }

  const request = {
    ...formData.value,
    email: fullEmail.value,
  };

  const response = await userStore.create(request);
  if (response) {
    generatedPassword.value = response.generatedPassword;
    showCreateModal.value = false;
    showPasswordModal.value = true;
    resetForm();
  } else if (userStore.error) {
    errorMessage.value = userStore.error;
    showErrorModal.value = true;
  }
}

function confirmDelete(user: any) {
  userToDelete.value = user;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!userToDelete.value) return;
  
  const deletedUserId = userToDelete.value.id;
  const success = await userStore.remove(deletedUserId);
  
  if (success) {
    showDeleteModal.value = false;
    userToDelete.value = null;
    
    // If user deleted their own account, log them out
    if (authStore.user?.id === deletedUserId) {
      authStore.logout();
      router.push('/login');
    }
  } else if (userStore.error) {
    showDeleteModal.value = false;
    errorMessage.value = userStore.error;
    showErrorModal.value = true;
  }
}

async function handleResetPassword(user: any) {
  const newPassword = await userStore.resetPassword(user.id);
  if (newPassword) {
    generatedPassword.value = newPassword;
    showPasswordModal.value = true;
  } else if (userStore.error) {
    errorMessage.value = userStore.error;
    showErrorModal.value = true;
  }
}

function copyPassword() {
  navigator.clipboard.writeText(generatedPassword.value);
}

function resetForm() {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    userType: 'SalesPerson' as 'Admin' | 'SalesPerson',
    groupIds: [],
  };
  emailUsername.value = '';
  emailError.value = '';
}

function closeCreateModal() {
  showCreateModal.value = false;
  resetForm();
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
              <button @click="confirmDelete(user)" class="btn-sm btn-danger" v-if="!user.isSuperAdmin">
                Delete
              </button>
              <span v-if="user.isSuperAdmin" class="badge">Super Admin</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="modal" @click.self="closeCreateModal">
      <div class="modal-content">
        <h2>Create User</h2>
        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>First Name *</label>
            <input v-model="formData.firstName" placeholder="Enter first name" required />
          </div>
          
          <div class="form-group">
            <label>Last Name *</label>
            <input v-model="formData.lastName" placeholder="Enter last name" required />
          </div>
          
          <div class="form-group">
            <label>Email *</label>
            <div class="email-input-wrapper">
              <input 
                v-model="emailUsername" 
                placeholder="username" 
                required 
                :class="{ 'input-error': emailError }"
              />
              <span class="email-domain">@visionhub.com</span>
            </div>
            <span v-if="emailError" class="error-text">{{ emailError }}</span>
            <span v-if="checkingEmail" class="checking-text">Checking availability...</span>
          </div>
          
          <div class="form-group">
            <label>User Type *</label>
            <select v-model="formData.userType">
              <option value="Admin">Admin</option>
              <option value="SalesPerson">Sales Person</option>
            </select>
          </div>
          
          <div class="form-group" v-if="formData.userType === 'SalesPerson'">
            <label>Assign to Groups *</label>
            <div class="checkbox-group">
              <label v-for="group in groupStore.groups" :key="group.id" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="group.id" 
                  v-model="formData.groupIds"
                />
                {{ group.name }}
              </label>
            </div>
            <span v-if="formData.groupIds.length === 0" class="hint-text">
              Select at least one group
            </span>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-primary" :disabled="!canSubmit">Create</button>
            <button type="button" @click="closeCreateModal" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Display Modal -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-content password-modal">
        <div class="modal-icon success">✓</div>
        <h2>Password Generated</h2>
        <p class="modal-message">Copy this password now. It won't be shown again.</p>
        <div class="password-display">
          <code>{{ generatedPassword }}</code>
          <button @click="copyPassword" class="btn-copy" title="Copy to clipboard">📋</button>
        </div>
        <div class="modal-actions centered">
          <button @click="showPasswordModal = false" class="btn-primary">Done</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content delete-modal">
        <div class="modal-icon warning">⚠</div>
        <h2>Confirm Delete</h2>
        <p class="modal-message">
          Are you sure you want to delete <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong>?
          <br>This action cannot be undone.
        </p>
        <div class="modal-actions centered">
          <button @click="handleDelete" class="btn-danger">Delete</button>
          <button @click="showDeleteModal = false; userToDelete = null" class="btn-secondary">Cancel</button>
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  background: #e2e8f0;
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
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

.modal-content input:focus,
.modal-content select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.email-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.email-input-wrapper input {
  border: none;
  border-radius: 0;
  flex: 1;
}

.email-input-wrapper input:focus {
  box-shadow: none;
}

.email-domain {
  background: #f7fafc;
  padding: 0.75rem;
  color: #718096;
  font-size: 0.95rem;
  border-left: 1px solid #e2e8f0;
}

.input-error {
  border-color: #e53e3e !important;
}

.error-text {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.checking-text {
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.hint-text {
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions.centered {
  justify-content: center;
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

/* Password Modal Styles */
.password-modal, .delete-modal, .error-modal {
  text-align: center;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.modal-icon.success {
  background: #c6f6d5;
  color: #22543d;
}

.modal-icon.warning {
  background: #fef3c7;
  color: #92400e;
}

.modal-icon.error {
  background: #fed7d7;
  color: #c53030;
}

.modal-message {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.password-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.password-display code {
  font-size: 1.1rem;
  color: #2d3748;
  font-family: monospace;
  letter-spacing: 1px;
}

.btn-copy {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.btn-copy:hover {
  transform: scale(1.1);
}
</style>
