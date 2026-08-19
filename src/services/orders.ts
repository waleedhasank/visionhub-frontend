import api from './api';
import type {
  Order,
  CreateOrderRequest,
  AddCancellationFeeRequest,
  OrderFilterParams,
  PagedResult,
} from '@/types';

export const orderService = {
  async getAll(params: OrderFilterParams): Promise<PagedResult<Order>> {
    const { data } = await api.get<PagedResult<Order>>('/api/orders', { params });
    return data;
  },

  async getById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/api/orders/${id}`);
    return data;
  },

  async create(request: CreateOrderRequest): Promise<Order> {
    const { data } = await api.post<Order>('/api/orders', request);
    return data;
  },

  async uploadProof(orderId: number, file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ fileUrl: string }>(
      `/api/orders/${orderId}/upload-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  async addCancellationFee(
    orderId: number,
    request: AddCancellationFeeRequest
  ): Promise<void> {
    await api.post(`/api/orders/${orderId}/cancellation-fee`, request);
  },
};
