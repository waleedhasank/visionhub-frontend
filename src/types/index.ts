// User types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'Admin' | 'SalesPerson';
  groups: string[];
  isSuperAdmin: boolean;
  createdOn: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'Admin' | 'SalesPerson';
  groupIds: number[];
}

export interface CreateUserResponse {
  user: User;
  generatedPassword: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'Admin' | 'SalesPerson';
  groupIds: number[];
}

// Group types
export interface Group {
  id: number;
  name: string;
  createdOn: string;
}

export interface CreateGroupRequest {
  name: string;
}

export interface UpdateGroupRequest {
  name: string;
}

// Order types
export interface Order {
  id: number;
  externalOrderId: string;
  orderSource: string;
  negotiatedAmount: number;
  currency: string;
  status: string;
  proofFileUrl?: string;
  createdOn: string;
  superDispatchCreatedOn?: string;
  lastSyncedOn?: string;
  createdByName: string;
  cancellation?: OrderCancellation;
}

export interface OrderCancellation {
  id: number;
  cancellationFee?: number;
  cancellationReason?: string;
  proofFileUrl?: string;
  createdOn: string;
  createdByName: string;
}

export interface CreateOrderRequest {
  orderId: string;
  orderSource: string;
  negotiatedAmount: number;
  currency: string;
}

export interface AddCancellationFeeRequest {
  cancellationFee?: number;
  cancellationReason?: string;
}

export interface OrderFilterParams {
  status?: string;
  salesPersonId?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

// Revenue types
export interface RevenueByMonth {
  year: number;
  month: number;
  totalRevenue: number;
  orderCount: number;
}

export interface RevenueBySalesPerson {
  salesPersonId: number;
  salesPersonName: string;
  totalAmount: number;
  activeOrderCount: number;
  totalCancellationFees: number;
  netRevenue: number;
}

// Pagination
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API response types
export interface ApiError {
  message: string;
  statusCode?: number;
}
