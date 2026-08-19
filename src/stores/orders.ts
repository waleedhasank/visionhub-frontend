import { defineStore } from 'pinia';
import { ref } from 'vue';
import { orderService } from '@/services/orders';
import type {
  Order,
  CreateOrderRequest,
  AddCancellationFeeRequest,
  OrderFilterParams,
  PagedResult,
} from '@/types';

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const pagination = ref({
    totalCount: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll(params: OrderFilterParams = {}) {
    loading.value = true;
    error.value = null;

    try {
      const result: PagedResult<Order> = await orderService.getAll(params);
      orders.value = result.items;
      pagination.value = {
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch orders';
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: number) {
    loading.value = true;
    error.value = null;

    try {
      currentOrder.value = await orderService.getById(id);
      return currentOrder.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch order';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(request: CreateOrderRequest) {
    loading.value = true;
    error.value = null;

    try {
      const order = await orderService.create(request);
      return order;
    } catch (err: any) {
      error.value = err.message || 'Failed to create order';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function uploadProof(orderId: number, file: File) {
    loading.value = true;
    error.value = null;

    try {
      const response = await orderService.uploadProof(orderId, file);
      return response.fileUrl;
    } catch (err: any) {
      error.value = err.message || 'Failed to upload proof';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function addCancellationFee(
    orderId: number,
    request: AddCancellationFeeRequest
  ) {
    loading.value = true;
    error.value = null;

    try {
      await orderService.addCancellationFee(orderId, request);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to add cancellation fee';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    orders,
    currentOrder,
    pagination,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    uploadProof,
    addCancellationFee,
  };
});
