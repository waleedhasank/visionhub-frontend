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

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    proofFile.value = target.files[0];
  }
}

async function handleSubmit() {
  if (!formData.value.orderId || formData.value.negotiatedAmount <= 0) {
    alert('Please fill all required fields');
    return;
  }

  const order = await orderStore.create(formData.value);
  
  if (order) {
    // Upload proof if provided
    if (proofFile.value) {
      await orderStore.uploadProof(order.id, proofFile.value);
    }
    
    alert('Order created successfully!');
    router.push('/sales/orders');
  } else {
    alert(orderStore.error || 'Failed to create order');
  }
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
</style>
