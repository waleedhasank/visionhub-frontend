import { defineStore } from 'pinia';
import { ref } from 'vue';
import { revenueService } from '@/services/revenue';
import type { RevenueByMonth, RevenueBySalesPerson } from '@/types';

export const useRevenueStore = defineStore('revenue', () => {
  const monthlyRevenue = ref<RevenueByMonth[]>([]);
  const salesPersonRevenue = ref<RevenueBySalesPerson[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchByMonth(months: 1 | 3 | 6 | 12) {
    loading.value = true;
    error.value = null;

    try {
      monthlyRevenue.value = await revenueService.getByMonth(months);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch monthly revenue';
    } finally {
      loading.value = false;
    }
  }

  async function fetchBySalesPerson() {
    loading.value = true;
    error.value = null;

    try {
      salesPersonRevenue.value = await revenueService.getBySalesPerson();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch salesperson revenue';
    } finally {
      loading.value = false;
    }
  }

  return {
    monthlyRevenue,
    salesPersonRevenue,
    loading,
    error,
    fetchByMonth,
    fetchBySalesPerson,
  };
});
