<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');

async function handleChangePassword() {
  if (formData.value.newPassword !== formData.value.confirmNewPassword) {
    errorMessage.value = 'New passwords do not match';
    showErrorModal.value = true;
    return;
  }

  if (formData.value.newPassword.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long';
    showErrorModal.value = true;
    return;
  }

  const success = await authStore.changePassword(formData.value);
  
  if (success) {
    showSuccessModal.value = true;
    formData.value = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };
  } else {
    errorMessage.value = authStore.error || 'Failed to change password';
    showErrorModal.value = true;
  }
}
</script>

<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <div class="settings-section">
      <h2>Change Password</h2>
      <form @submit.prevent="handleChangePassword" class="password-form">
        <div class="form-group">
          <label>Current Password *</label>
          <input
            v-model="formData.currentPassword"
            type="password"
            required
          />
        </div>

        <div class="form-group">
          <label>New Password *</label>
          <input
            v-model="formData.newPassword"
            type="password"
            required
            minlength="8"
          />
          <p class="help-text">Minimum 8 characters</p>
        </div>

        <div class="form-group">
          <label>Confirm New Password *</label>
          <input
            v-model="formData.confirmNewPassword"
            type="password"
            required
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="authStore.loading">
          {{ authStore.loading ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal">
      <div class="modal-content success-modal">
        <div class="modal-icon success">✓</div>
        <h2>Success</h2>
        <p class="modal-message">Your password has been changed successfully.</p>
        <div class="modal-actions centered">
          <button @click="showSuccessModal = false" class="btn-primary">OK</button>
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
.settings-page { width: 100%; }
h1 { margin-bottom: 2rem; color: #2d3748; }

.settings-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.settings-section h2 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #4a5568; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
.form-group input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
.help-text { font-size: 0.875rem; color: #718096; margin-top: 0.25rem; }
.btn-primary { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 1rem; }
.btn-primary:hover { background: #5a67d8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Modals */
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; min-width: 350px; }
.success-modal, .error-modal { text-align: center; }
.modal-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem; }
.modal-icon.success { background: #c6f6d5; color: #22543d; }
.modal-icon.error { background: #fed7d7; color: #c53030; }
.modal-content h2 { margin: 0 0 1rem 0; color: #2d3748; }
.modal-message { color: #4a5568; margin-bottom: 1.5rem; }
.modal-actions { display: flex; gap: 1rem; }
.modal-actions.centered { justify-content: center; }
</style>
