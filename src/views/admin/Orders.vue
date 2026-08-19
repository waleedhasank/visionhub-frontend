<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useOrderStore } from '@/stores/orders';
import { useUserStore } from '@/stores/users';
import type { Order, AddCancellationFeeRequest } from '@/types';

const orderStore = useOrderStore();
const userStore = useUserStore();

// Filter state
const filters = ref({
  status: '',
  salesPersonId: undefined as number | undefined,
  startDate: '',
  endDate: '',
  searchTerm: '',
  page: 1,
  pageSize: 50,
});

// Modal state
const showCancellationModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const cancellationFee = ref<number | undefined>(undefined);
const cancellationReason = ref('');
const cancellationFile = ref<File | null>(null);

// Debounce timer for search
let searchTimeout: number | null = null;

// Load data on mount
onMounted(async () => {
  await userStore.fetchAll();
  await loadOrders();
});

// Watch search term with debounce
watch(() => filters.value.searchTerm, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    filters.value.page = 1; // Reset to first page
    loadOrders();
  }, 400) as unknown as number;
});

async function loadOrders() {
  const params: any = { ...filters.value };
  // Remove empty values
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === undefined) {
      delete params[key];
    }
  });
  await orderStore.fetchAll(params);
}

function refreshOrders() {
  loadOrders();
}

function resetFilters() {
  filters.value = {
    status: '',
    salesPersonId: undefined,
    startDate: '',
    endDate: '',
    searchTerm: '',
    page: 1,
    pageSize: 50,
  };
  loadOrders();
}

function nextPage() {
  if (filters.value.page < orderStore.pagination.totalPages) {
    filters.value.page++;
    loadOrders();
  }
}

function prevPage() {
  if (filters.value.page > 1) {
    filters.value.page--;
    loadOrders();
  }
}

function goToPage(page: number) {
  filters.value.page = page;
  loadOrders();
}

function openCancellationModal(order: Order) {
  if (order.status.toLowerCase() !== 'cancelled') {
    alert('Only cancelled orders can have a cancellation fee added.');
    return;
  }
  if (order.cancellation) {
    alert('This order already has a cancellation fee.');
    return;
  }
  selectedOrder.value = order;
  cancellationFee.value = undefined;
  cancellationReason.value = '';
  cancellationFile.value = null;
  showCancellationModal.value = true;
}

function closeCancellationModal() {
  showCancellationModal.value = false;
  selectedOrder.value = null;
  cancellationFee.value = undefined;
  cancellationReason.value = '';
  cancellationFile.value = null;
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    cancellationFile.value = target.files[0];
  }
}

async function submitCancellationFee() {
  if (!selectedOrder.value) return;

  const request: AddCancellationFeeRequest = {
    cancellationFee: cancellationFee.value,
    cancellationReason: cancellationReason.value || undefined,
  };

  const success = await orderStore.addCancellationFee(selectedOrder.value.id, request);
  if (success) {
    // If file is provided, upload it
    if (cancellationFile.value) {
      await orderStore.uploadProof(selectedOrder.value.id, cancellationFile.value);
    }
    alert('Cancellation fee added successfully!');
    closeCancellationModal();
    loadOrders(); // Refresh the list
  } else {
    alert(`Failed to add cancellation fee: ${orderStore.error}`);
  }
}

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('completed') || s.includes('delivered')) return '#48bb78';
  if (s.includes('cancelled')) return '#f56565';
  if (s.includes('in progress') || s.includes('transit')) return '#ed8936';
  if (s.includes('pending')) return '#ecc94b';
  return '#718096';
}

// Get sales people
const salesPeople = computed(() => {
  return userStore.users.filter(u => u.userType === 'SalesPerson');
});

// Generate page numbers for pagination
function getPageNumbers(): number[] {
  const total = orderStore.pagination.totalPages;
  const current = filters.value.page;
  const pages: number[] = [];
  
  if (total <= 7) {
    // Show all pages
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show first, last, current and neighbors
    pages.push(1);
    if (current > 3) pages.push(-1); // Ellipsis
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push(-1); // Ellipsis
    pages.push(total);
  }
  
  return pages;
}
</script>

<script lang="ts">
import { computed } from 'vue';
export default { name: 'AdminOrders' };
</script>

<template>
  <div class="orders-page">
    <div class="header">
      <h1>Order Management</h1>
      <button @click="refreshOrders" class="btn btn-primary" :disabled="orderStore.loading">
        🔄 {{ orderStore.loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <h3>Filters</h3>
      <div class="filters-grid">
        <!-- Status Filter -->
        <div class="filter-item">
          <label for="status">Status:</label>
          <select 
            id="status" 
            v-model="filters.status" 
            @change="filters.page = 1; loadOrders()"
            class="filter-input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Salesperson Filter -->
        <div class="filter-item">
          <label for="salesperson">Sales Person:</label>
          <select 
            id="salesperson" 
            v-model="filters.salesPersonId" 
            @change="filters.page = 1; loadOrders()"
            class="filter-input"
          >
            <option :value="undefined">All Sales People</option>
            <option 
              v-for="person in salesPeople" 
              :key="person.id" 
              :value="person.id"
            >
              {{ person.firstName }} {{ person.lastName }}
            </option>
          </select>
        </div>

        <!-- Start Date -->
        <div class="filter-item">
          <label for="startDate">Start Date:</label>
          <input 
            id="startDate" 
            type="date" 
            v-model="filters.startDate" 
            @change="filters.page = 1; loadOrders()"
            class="filter-input"
          />
        </div>

        <!-- End Date -->
        <div class="filter-item">
          <label for="endDate">End Date:</label>
          <input 
            id="endDate" 
            type="date" 
            v-model="filters.endDate" 
            @change="filters.page = 1; loadOrders()"
            class="filter-input"
          />
        </div>

        <!-- Search Term -->
        <div class="filter-item search-item">
          <label for="search">Search (Order ID, Name):</label>
          <input 
            id="search" 
            type="text" 
            v-model="filters.searchTerm" 
            placeholder="Type to search..."
            class="filter-input"
          />
        </div>

        <!-- Reset Button -->
        <div class="filter-item">
          <label>&nbsp;</label>
          <button @click="resetFilters" class="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <p v-if="orderStore.loading">Loading orders...</p>
      <p v-else-if="orderStore.error" class="error-text">{{ orderStore.error }}</p>
      <p v-else>
        Showing {{ orderStore.orders.length }} of {{ orderStore.pagination.totalCount }} orders
        (Page {{ orderStore.pagination.page }} of {{ orderStore.pagination.totalPages }})
      </p>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Source</th>
            <th>Sales Person</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created On</th>
            <th>Last Synced</th>
            <th>Cancellation Fee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orderStore.orders.length === 0">
            <td colspan="9" class="no-data">No orders found</td>
          </tr>
          <tr v-for="order in orderStore.orders" :key="order.id">
            <td class="order-id">{{ order.externalOrderId }}</td>
            <td>{{ order.orderSource }}</td>
            <td>{{ order.createdByName }}</td>
            <td class="amount">{{ order.currency }} {{ order.negotiatedAmount.toFixed(2) }}</td>
            <td>
              <span 
                class="status-badge" 
                :style="{ backgroundColor: getStatusColor(order.status) }"
              >
                {{ order.status }}
              </span>
            </td>
            <td>{{ new Date(order.createdOn).toLocaleString() }}</td>
            <td>{{ order.lastSyncedOn ? new Date(order.lastSyncedOn).toLocaleString() : 'N/A' }}</td>
            <td>
              <span v-if="order.cancellation">
                {{ order.currency }} {{ order.cancellation.cancellationFee?.toFixed(2) || '0.00' }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="actions">
              <button 
                v-if="order.status.toLowerCase() === 'cancelled' && !order.cancellation"
                @click="openCancellationModal(order)"
                class="btn-small btn-warning"
              >
                Add Fee
              </button>
              <span v-else-if="order.cancellation" class="fee-added">✓ Fee Added</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="orderStore.pagination.totalPages > 1">
      <button 
        @click="prevPage" 
        :disabled="filters.page === 1 || orderStore.loading"
        class="btn btn-secondary"
      >
        ← Previous
      </button>

      <div class="page-numbers">
        <button 
          v-for="page in getPageNumbers()" 
          :key="page"
          @click="page > 0 ? goToPage(page) : null"
          :class="['page-btn', { active: page === filters.page, ellipsis: page === -1 }]"
          :disabled="page === -1 || orderStore.loading"
        >
          {{ page === -1 ? '...' : page }}
        </button>
      </div>

      <button 
        @click="nextPage" 
        :disabled="filters.page === orderStore.pagination.totalPages || orderStore.loading"
        class="btn btn-secondary"
      >
        Next →
      </button>
    </div>

    <!-- Cancellation Fee Modal -->
    <div v-if="showCancellationModal" class="modal-overlay" @click.self="closeCancellationModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add Cancellation Fee</h2>
          <button @click="closeCancellationModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p><strong>Order ID:</strong> {{ selectedOrder?.externalOrderId }}</p>
          <p><strong>Sales Person:</strong> {{ selectedOrder?.createdByName }}</p>

          <div class="form-group">
            <label for="cancellationFee">Cancellation Fee (Optional):</label>
            <input 
              id="cancellationFee" 
              type="number" 
              step="0.01" 
              v-model="cancellationFee"
              placeholder="e.g., 50.00"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="cancellationReason">Reason (Optional):</label>
            <textarea 
              id="cancellationReason" 
              v-model="cancellationReason"
              placeholder="Why was this order cancelled?"
              rows="3"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="cancellationFile">Proof File (Optional):</label>
            <input 
              id="cancellationFile" 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              @change="handleFileChange"
              class="form-input"
            />
            <small>PDF or Image (JPG, PNG)</small>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeCancellationModal" class="btn btn-secondary">
            Cancel
          </button>
          <button 
            @click="submitCancellationFee" 
            class="btn btn-primary"
            :disabled="orderStore.loading"
          >
            {{ orderStore.loading ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #2d3748;
  font-size: 2rem;
}

/* Filters */
.filters-section {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filters-section h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.search-item {
  grid-column: span 2;
}

.filter-item label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: 0.875rem;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Results Summary */
.results-summary {
  margin-bottom: 1rem;
  color: #4a5568;
}

.error-text {
  color: #f56565;
}

/* Table */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table thead {
  background: #667eea;
  color: white;
}

.orders-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
}

.orders-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.orders-table tbody tr:hover {
  background: #f7fafc;
}

.no-data {
  text-align: center;
  padding: 2rem !important;
  color: #a0aec0;
}

.order-id {
  font-family: monospace;
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #2d3748;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.actions {
  text-align: center;
}

.fee-added {
  color: #48bb78;
  font-weight: 500;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled):not(.ellipsis) {
  background: #edf2f7;
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-btn.ellipsis {
  border: none;
  cursor: default;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-small {
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-warning {
  background: #ed8936;
  color: white;
}

.btn-warning:hover {
  background: #dd6b20;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #a0aec0;
  line-height: 1;
}

.close-btn:hover {
  color: #718096;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.form-group {
  margin-top: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #718096;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
</style>
