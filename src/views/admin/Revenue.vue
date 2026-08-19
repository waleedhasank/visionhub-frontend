<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRevenueStore } from '@/stores/revenue';

const revenueStore = useRevenueStore();

// Selected time period
const selectedPeriod = ref<1 | 3 | 6 | 12>(1);

// Load data on mount
onMounted(async () => {
  await loadData();
});

async function loadData() {
  await Promise.all([
    revenueStore.fetchByMonth(selectedPeriod.value),
    revenueStore.fetchBySalesPerson(),
  ]);
}

async function changePeriod(months: 1 | 3 | 6 | 12) {
  selectedPeriod.value = months;
  await revenueStore.fetchByMonth(months);
}

// Computed totals for monthly revenue
const monthlyTotals = computed(() => {
  const data = revenueStore.monthlyRevenue;
  return {
    totalRevenue: data.reduce((sum, item) => sum + item.totalRevenue, 0),
    totalOrders: data.reduce((sum, item) => sum + item.orderCount, 0),
  };
});

// Computed totals for salesperson revenue
const salesPersonTotals = computed(() => {
  const data = revenueStore.salesPersonRevenue;
  return {
    totalAmount: data.reduce((sum, item) => sum + item.totalAmount, 0),
    totalActiveOrders: data.reduce((sum, item) => sum + item.activeOrderCount, 0),
    totalCancellationFees: data.reduce((sum, item) => sum + item.totalCancellationFees, 0),
    totalNetRevenue: data.reduce((sum, item) => sum + item.netRevenue, 0),
  };
});

// Format month name
function getMonthName(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// Format currency
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
</script>

<script lang="ts">
export default { name: 'AdminRevenue' };
</script>

<template>
  <div class="revenue-page">
    <div class="header">
      <h1>Revenue Dashboard</h1>
      <button @click="loadData" class="btn btn-primary" :disabled="revenueStore.loading">
        🔄 {{ revenueStore.loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="revenueStore.error" class="error-banner">
      <p>{{ revenueStore.error }}</p>
    </div>

    <!-- Period Selector -->
    <div class="period-selector">
      <h3>Select Time Period:</h3>
      <div class="period-buttons">
        <button 
          @click="changePeriod(1)"
          :class="['period-btn', { active: selectedPeriod === 1 }]"
          :disabled="revenueStore.loading"
        >
          1 Month
        </button>
        <button 
          @click="changePeriod(3)"
          :class="['period-btn', { active: selectedPeriod === 3 }]"
          :disabled="revenueStore.loading"
        >
          3 Months
        </button>
        <button 
          @click="changePeriod(6)"
          :class="['period-btn', { active: selectedPeriod === 6 }]"
          :disabled="revenueStore.loading"
        >
          6 Months
        </button>
        <button 
          @click="changePeriod(12)"
          :class="['period-btn', { active: selectedPeriod === 12 }]"
          :disabled="revenueStore.loading"
        >
          12 Months
        </button>
      </div>
    </div>

    <!-- Revenue by Month Section -->
    <div class="section">
      <h2>📊 Revenue by Month</h2>
      
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">{{ formatCurrency(monthlyTotals.totalRevenue) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">{{ monthlyTotals.totalOrders }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average per Order</div>
          <div class="stat-value">
            {{ monthlyTotals.totalOrders > 0 
              ? formatCurrency(monthlyTotals.totalRevenue / monthlyTotals.totalOrders) 
              : '$0.00' 
            }}
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Revenue</th>
              <th>Order Count</th>
              <th>Average per Order</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="revenueStore.loading">
              <td colspan="4" class="loading-cell">Loading...</td>
            </tr>
            <tr v-else-if="revenueStore.monthlyRevenue.length === 0">
              <td colspan="4" class="no-data">No revenue data available for this period</td>
            </tr>
            <tr v-for="item in revenueStore.monthlyRevenue" :key="`${item.year}-${item.month}`">
              <td class="month-cell">{{ getMonthName(item.year, item.month) }}</td>
              <td class="revenue-cell">{{ formatCurrency(item.totalRevenue) }}</td>
              <td class="count-cell">{{ item.orderCount }}</td>
              <td class="avg-cell">
                {{ item.orderCount > 0 
                  ? formatCurrency(item.totalRevenue / item.orderCount) 
                  : '$0.00' 
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Revenue by Sales Person Section -->
    <div class="section">
      <h2>👥 Revenue by Sales Person</h2>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-label">Total Amount</div>
          <div class="stat-value">{{ formatCurrency(salesPersonTotals.totalAmount) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Orders</div>
          <div class="stat-value">{{ salesPersonTotals.totalActiveOrders }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cancellation Fees</div>
          <div class="stat-value negative">{{ formatCurrency(salesPersonTotals.totalCancellationFees) }}</div>
        </div>
        <div class="stat-card primary">
          <div class="stat-label">Net Revenue</div>
          <div class="stat-value">{{ formatCurrency(salesPersonTotals.totalNetRevenue) }}</div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Sales Person</th>
              <th>Total Amount</th>
              <th>Active Orders</th>
              <th>Cancellation Fees</th>
              <th>Net Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="revenueStore.loading">
              <td colspan="5" class="loading-cell">Loading...</td>
            </tr>
            <tr v-else-if="revenueStore.salesPersonRevenue.length === 0">
              <td colspan="5" class="no-data">No sales data available</td>
            </tr>
            <tr v-for="item in revenueStore.salesPersonRevenue" :key="item.salesPersonId">
              <td class="name-cell">{{ item.salesPersonName }}</td>
              <td class="revenue-cell">{{ formatCurrency(item.totalAmount) }}</td>
              <td class="count-cell">{{ item.activeOrderCount }}</td>
              <td class="fee-cell">{{ formatCurrency(item.totalCancellationFees) }}</td>
              <td class="net-cell">{{ formatCurrency(item.netRevenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Info Note -->
    <div class="info-note">
      <p><strong>Note:</strong> Net Revenue = Total Amount from Active Orders - Cancellation Fees from Cancelled Orders</p>
      <p>All amounts are in USD. Data is updated in real-time when orders are synced from SuperDispatch.</p>
    </div>
  </div>
</template>

<style scoped>
.revenue-page {
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

/* Error Banner */
.error-banner {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.error-banner p {
  margin: 0;
}

/* Period Selector */
.period-selector {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.period-selector h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.125rem;
}

.period-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.period-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #cbd5e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1rem;
}

.period-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #a0aec0;
}

.period-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.period-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Section */
.section {
  margin-bottom: 3rem;
}

.section h2 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-card.primary {
  background: #667eea;
  border-color: #667eea;
}

.stat-card.primary .stat-label,
.stat-card.primary .stat-value {
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-value.negative {
  color: #f56565;
}

/* Table */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #667eea;
  color: white;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.data-table tbody tr:hover {
  background: #f7fafc;
}

.loading-cell,
.no-data {
  text-align: center;
  padding: 2rem !important;
  color: #a0aec0;
}

.month-cell,
.name-cell {
  font-weight: 600;
  color: #2d3748;
}

.revenue-cell,
.net-cell {
  font-weight: 600;
  color: #48bb78;
}

.count-cell,
.avg-cell {
  color: #4a5568;
}

.fee-cell {
  color: #f56565;
  font-weight: 500;
}

/* Info Note */
.info-note {
  background: #e6fffa;
  border: 1px solid #81e6d9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 2rem;
}

.info-note p {
  margin: 0.5rem 0;
  color: #234e52;
  font-size: 0.875rem;
}

.info-note p:first-child {
  margin-top: 0;
}

.info-note p:last-child {
  margin-bottom: 0;
}

/* Button */
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
</style>
