import api from './api';
import type { RevenueByMonth, RevenueBySalesPerson } from '@/types';

export const revenueService = {
  async getByMonth(months: 1 | 3 | 6 | 12): Promise<RevenueByMonth[]> {
    const { data } = await api.get<RevenueByMonth[]>('/api/revenue/by-month', {
      params: { months },
    });
    return data;
  },

  async getBySalesPerson(): Promise<RevenueBySalesPerson[]> {
    const { data } = await api.get<RevenueBySalesPerson[]>(
      '/api/revenue/by-salesperson'
    );
    return data;
  },
};
