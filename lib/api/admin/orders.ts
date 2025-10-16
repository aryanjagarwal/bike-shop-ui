// Admin Orders API - TanStack Query hooks for admin order management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '../client';
import { OrderStatus } from '@/lib/types/allTypes';
import type { OrderWithDetails } from '../orders';

// ============================================
// Type Definitions
// ============================================

// Get All Orders Request (Admin)
export interface GetAllOrdersRequest {
  status?: OrderStatus;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
  userId?: string; // Filter by specific user
  search?: string; // Search by order number or user email
}

// Get All Orders Response (Admin)
export interface GetAllOrdersResponse {
  success: boolean;
  data: OrderWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Update Order Status Request
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}

// Update Order Status Response
export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId: string;
    orderNumber: string;
    status: OrderStatus;
    subtotal: string;
    taxAmount: string;
    shippingCost: string;
    totalAmount: string;
    shippingAddressId: string | null;
    billingAddressId: string | null;
    paymentIntentId: string | null;
    paymentStatus: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    shippedAt: string | null;
    deliveredAt: string | null;
    trackingNumber?: string;
  };
}

// Shipping Settings
export interface ShippingSettings {
  id: string;
  shippingCharge: string; // Decimal as string
  freeShippingThreshold: string; // Decimal as string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Update Shipping Settings Request
export interface UpdateShippingSettingsRequest {
  shippingCharge: number;
  freeShippingThreshold: number;
}

// Update Shipping Settings Response
export interface UpdateShippingSettingsResponse {
  success: boolean;
  message: string;
  data: ShippingSettings;
}

// Get Shipping Settings Response
export interface GetShippingSettingsResponse {
  success: boolean;
  data: ShippingSettings;
}

// Order Statistics (optional, for dashboard)
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (
  params?: GetAllOrdersRequest
): Promise<GetAllOrdersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/orders?${queryString}` : '/api/orders';
  
  return apiClient.get<GetAllOrdersResponse>(endpoint);
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (
  orderId: string,
  request: UpdateOrderStatusRequest
): Promise<UpdateOrderStatusResponse> => {
  return apiClient.patch<UpdateOrderStatusResponse>(
    `/api/orders/${orderId}/status`,
    request
  );
};

/**
 * Get shipping settings
 */
export const getShippingSettings = async (): Promise<GetShippingSettingsResponse> => {
  return apiClient.get<GetShippingSettingsResponse>('/api/orders/shipping/settings');
};

/**
 * Update shipping settings (Admin only)
 */
export const updateShippingSettings = async (
  request: UpdateShippingSettingsRequest
): Promise<UpdateShippingSettingsResponse> => {
  return apiClient.put<UpdateShippingSettingsResponse>(
    '/api/orders/shipping/settings',
    request
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to get all orders (Admin)
 * @param params - Filter parameters for orders
 * @param options - React Query options
 */
export const useAdminOrders = (
  params?: GetAllOrdersRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => getAllOrders(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 2, // 2 minutes default
  });
};

/**
 * Hook to update order status (Admin)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      orderId, 
      request 
    }: { 
      orderId: string; 
      request: UpdateOrderStatusRequest 
    }) => updateOrderStatus(orderId, request),
    onSuccess: (data, variables) => {
      // Invalidate the specific order query
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      
      // Invalidate the admin orders list
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      
      // Invalidate user's orders list if they have one
      queryClient.invalidateQueries({ queryKey: ['orders', 'me'] });
    },
    onError: (error: any) => {
      console.error('Failed to update order status:', error);
    },
  });
};

/**
 * Hook to get shipping settings
 */
export const useShippingSettings = (
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: ['shipping', 'settings'],
    queryFn: getShippingSettings,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 10, // 10 minutes default
  });
};

/**
 * Hook to update shipping settings (Admin)
 */
export const useUpdateShippingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateShippingSettingsRequest) => 
      updateShippingSettings(request),
    onSuccess: () => {
      // Invalidate shipping settings query
      queryClient.invalidateQueries({ queryKey: ['shipping', 'settings'] });
    },
    onError: (error: any) => {
      console.error('Failed to update shipping settings:', error);
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format shipping charge for display
 */
export const formatShippingCharge = (charge: string | number): string => {
  const amount = typeof charge === 'string' ? parseFloat(charge) : charge;
  return `£${amount.toFixed(2)}`;
};

/**
 * Check if order can be updated to a specific status
 */
export const canUpdateToStatus = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
  };

  return statusFlow[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get available status transitions for an order
 */
export const getAvailableStatusTransitions = (
  currentStatus: OrderStatus
): OrderStatus[] => {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
  };

  return statusFlow[currentStatus] || [];
};

/**
 * Calculate order statistics from orders list
 */
export const calculateOrderStatistics = (
  orders: OrderWithDetails[]
): OrderStatistics => {
  const stats: OrderStatistics = {
    totalOrders: orders.length,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
  };

  orders.forEach((order) => {
    // Calculate revenue (only for completed orders)
    if (order.status === 'DELIVERED') {
      stats.totalRevenue += order.summary.total;
    }

    // Count by status
    switch (order.status) {
      case 'PENDING':
        stats.pendingOrders++;
        break;
      case 'CONFIRMED':
        stats.confirmedOrders++;
        break;
      case 'PROCESSING':
        stats.processingOrders++;
        break;
      case 'SHIPPED':
        stats.shippedOrders++;
        break;
      case 'DELIVERED':
        stats.deliveredOrders++;
        break;
      case 'CANCELLED':
        stats.cancelledOrders++;
        break;
      case 'REFUNDED':
        stats.refundedOrders++;
        break;
    }
  });

  return stats;
};

/**
 * Format order statistics for display
 */
export const formatOrderStatistics = (stats: OrderStatistics) => {
  return {
    ...stats,
    totalRevenue: `£${stats.totalRevenue.toFixed(2)}`,
  };
};
