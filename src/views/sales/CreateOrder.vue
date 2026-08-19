<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/orders';

const router = useRouter();
const orderStore = useOrderStore();

const formData = ref({
  orderId: '',
  orderSource: 'SuperDispatch',
  negotiatedAmount: 0,
  currency: 'USD',
});

const proofFile = ref<File | null>(null);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    proofFile.value = target.files[0];
  }
}

async function handleSubmit() {
  if (!formData.value.orderId || formData.value.negotiatedAmount <= 0) {
    errorMessage.value = 'Please fill all required fields';
    showErrorModal.value = true;
    return;
  }

  const order = await orderStore.create(formData.value);
  
  if (order) {
    // Upload proof if provided
    if (proofFile.value) {
      await orderStore.uploadProof(order.id, proofFile.value);
    }
    
    showSuccessModal.value = true;
  } else {
    errorMessage.value = orderStore.error || 'Failed to create order';
    showErrorModal.value = true;
  }
}

function handleSuccessClose() {
  showSuccessModal.value = false;
  router.push('/sales/orders');
}
</script>

<template>
  <div class="create-order-page">
    <h1>Create New Order</h1>

    <form @submit.prevent="handleSubmit" class="order-form">
      <div class="form-row">
        <div class="form-group">
          <label>Order ID *</label>
          <input
            v-model="formData.orderId"
            placeholder="Enter SuperDispatch Order ID"
            required
          />
        </div>

        <div class="form-group">
          <label>Order Source *</label>
          <select v-model="formData.orderSource" required>
            <option value="SuperDispatch">SuperDispatch</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Negotiated Amount *</label>
          <input
            v-model.number="formData.negotiatedAmount"
            type="number"
            step="0.01"
            placeholder="Enter amount"
            required
          />
        </div>

        <div class="form-group">
          <label>Currency *</label>
          <select v-model="formData.currency" required>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Proof (Optional)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          @change="handleFileChange"
        />
        <p class="help-text">PDF, JPEG, or PNG (max 10MB)</p>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="orderStore.loading">
          {{ orderStore.loading ? 'Creating...' : 'Create Order' }}
        </button>
        <button type="button" @click="router.back()" class="btn-secondary">
          Cancel
        </button>
      </div>
    </form>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal">
      <div class="modal-content success-modal">
        <div class="modal-icon success">✓</div>
        <h2>Order Created</h2>
        <p class="modal-message">Your order has been created successfully.</p>
        <div class="modal-actions centered">
          <button @click="handleSuccessClose" class="btn-primary">View Orders</button>
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
.create-order-page { max-width: 800px; }
h1 { margin-bottom: 2rem; color: #2d3748; }
.order-form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 0.5rem; color: #4a5568; font-weight: 500; }
.form-group input, .form-group select { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 1rem; }
.help-text { font-size: 0.875rem; color: #718096; margin-top: 0.25rem; }
.form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-primary { background: #48bb78; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 500; flex: 1; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #e2e8f0; color: #2d3748; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; }

/* Modals */
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; min-width: 400px; }
.success-modal, .error-modal { text-align: center; }
.modal-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem; }
.modal-icon.success { background: #c6f6d5; color: #22543d; }
.modal-icon.error { background: #fed7d7; color: #c53030; }
.modal-content h2 { margin: 0 0 1rem 0; color: #2d3748; }
.modal-message { color: #4a5568; margin-bottom: 1.5rem; }
.modal-actions { display: flex; gap: 1rem; }
.modal-actions.centered { justify-content: center; }
</style>
