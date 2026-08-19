<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrderStore } from '@/stores/orders';

const orderStore = useOrderStore();

onMounted(async () => {
  await orderStore.fetchAll({ page: 1, pageSize: 50 });
});

async function handleRefresh() {
  await orderStore.fetchAll({ page: 1, pageSize: 50 });
}
</script>

<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>My Orders</h1>
      <button @click="handleRefresh" class="btn-primary">🔄 Refresh</button>
    </div>

    <p class="subtitle">Showing current and previous month orders</p>

    <div v-if="orderStore.loading" class="loading">Loading...</div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created On</th>
            <th>Proof</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orderStore.orders" :key="order.id">
            <td>{{ order.externalOrderId }}</td>
            <td>${{ order.negotiatedAmount.toFixed(2) }}</td>
            <td><span class="status-badge">{{ order.status }}</span></td>
            <td>{{ new Date(order.createdOn).toLocaleDateString() }}</td>
            <td>
              <a v-if="order.proofFileUrl" :href="order.proofFileUrl" target="_blank">View</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <p>Total: {{ orderStore.pagination.totalCount }} orders</p>
    </div>
  </div>
</template>

<style scoped>
.orders-page { width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
h1 { margin: 0; color: #2d3748; }
.subtitle { color: #718096; margin-bottom: 2rem; }
.table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
th { background: #f7fafc; font-weight: 600; color: #4a5568; }
.btn-primary { background: #48bb78; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 500; }
.status-badge { background: #bee3f8; color: #2c5282; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; }
.pagination { margin-top: 1rem; text-align: center; color: #718096; }
.loading { text-align: center; padding: 2rem; color: #718096; }
</style>
