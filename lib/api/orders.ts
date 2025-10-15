// Orders API - TanStack Query hooks for order management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { Order, OrderItem, OrderStatus, PaymentStatus, Address, User } from '@/lib/types/allTypes';
import type { Bicycle, BicycleImage } from '@/lib/types/allTypes';
import type { Part, PartImage } from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

export enum DeliveryType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
}

// Extended Order Item with full product details
export interface OrderItemWithDetails extends Omit<OrderItem, 'bicycle' | 'part'> {
  bicycle: (Bicycle & { images: BicycleImage[] }) | null;
  part: (Part & { images: PartImage[] }) | null;
}

// Extended Order with all details
export interface OrderWithDetails extends Omit<Order, 'user' | 'items' | 'shippingAddress' | 'billingAddress' | 'coupons' | 'payments'> {
  items: OrderItemWithDetails[];
  shippingAddress: Address;
  billingAddress: Address;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  coupons: OrderCouponWithDetails[];
  payments: any[]; // Payment details
  summary: OrderSummary;
}

export interface OrderCouponWithDetails {
  id: string;
  orderId: string;
  couponId: string;
  discountAmount: string;
  appliedAt: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    discountType: string;
    discountValue: string;
    minOrderAmount: string;
    usageLimit: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  shippingCost: number;
  netAmount: number;
  vatAmount: number;
  total: number;
  currency: string;
  formatted: {
    subtotal: string;
    discount: string;
    subtotalAfterDiscount: string;
    shippingCost: string;
    netAmount: string;
    vatAmount: string;
    total: string;
  };
}

// ============================================
// Request/Response Types
// ============================================

export interface CreateCODOrderRequest {
  shippingAddressId: string;
  billingAddressId: string;
  deliveryType?: DeliveryType;
  scheduledTime?: string; // ISO date string
  notes?: string;
  couponCode?: string;
}

export interface CreateCODOrderResponse {
  success: boolean;
  message: string;
  data: OrderWithDetails;
}

export interface CreatePaymentIntentRequest {
  shippingAddressId: string;
  billingAddressId: string;
  couponCode?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    breakdown: {
      subtotal: number;
      discount: number;
      shippingCost: number;
      netAmount: number;
      vatAmount: number;
      total: number;
      currency: string;
      formatted: {
        subtotal: string;
        discount: string;
        subtotalAfterDiscount: string;
        shippingCost: string;
        netAmount: string;
        vatAmount: string;
        total: string;
      };
    };
    appliedCoupon?: {
      code: string;
      name: string;
      discountType: string;
      discountValue: number;
      discountAmount: number;
    };
  };
}

export interface ConfirmStripeOrderRequest {
  paymentIntentId: string;
  shippingAddressId: string;
  billingAddressId: string;
  deliveryType?: DeliveryType;
  scheduledTime?: string; // ISO date string
  notes?: string;
  couponCode?: string;
}

export interface ConfirmStripeOrderResponse {
  success: boolean;
  message: string;
  data: OrderWithDetails;
}

// Get My Orders Request
export interface GetMyOrdersRequest {
  status?: OrderStatus;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

// Get My Orders Response
export interface GetMyOrdersResponse {
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

// Get Order by ID Response
export interface GetOrderByIdResponse {
  success: boolean;
  data: OrderWithDetails;
}

// Cancel Order Request
export interface CancelOrderRequest {
  reason?: string;
}

// Cancel Order Response
export interface CancelOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

// ============================================
// API Functions
// ============================================

/**
 * Create a Cash on Delivery (COD) order
 */
export const createCODOrder = async (
  request: CreateCODOrderRequest
): Promise<CreateCODOrderResponse> => {
  return apiClient.post<CreateCODOrderResponse>('/api/orders/cod', request);
};

/**
 * Create a Stripe payment intent for order
 */
export const createPaymentIntent = async (
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  return apiClient.post<CreatePaymentIntentResponse>(
    '/api/orders/payment-intent',
    request
  );
};

/**
 * Confirm Stripe payment and create order
 */
export const confirmStripeOrder = async (
  request: ConfirmStripeOrderRequest
): Promise<ConfirmStripeOrderResponse> => {
  return apiClient.post<ConfirmStripeOrderResponse>(
    '/api/orders/confirm-stripe',
    request
  );
};

/**
 * Get my orders with filters
 */
export const getMyOrders = async (
  params?: GetMyOrdersRequest
): Promise<GetMyOrdersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/orders/me?${queryString}` : '/api/orders/me';
  
  return apiClient.get<GetMyOrdersResponse>(endpoint);
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<GetOrderByIdResponse> => {
  return apiClient.get<GetOrderByIdResponse>(`/api/orders/${orderId}`);
};

/**
 * Cancel an order
 */
export const cancelOrder = async (
  orderId: string,
  request?: CancelOrderRequest
): Promise<CancelOrderResponse> => {
  return apiClient.post<CancelOrderResponse>(
    `/api/orders/${orderId}/cancel`,
    request || {}
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to create a COD order
 */
export const useCreateCODOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCODOrder,
    onSuccess: (data) => {
      // Invalidate cart queries since order was placed
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Optionally invalidate orders list if you have one
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      console.error('Failed to create COD order:', error);
    },
  });
};

/**
 * Hook to create a payment intent
 */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: createPaymentIntent,
    onError: (error: any) => {
      console.error('Failed to create payment intent:', error);
    },
  });
};

/**
 * Hook to confirm Stripe payment and create order
 */
export const useConfirmStripeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmStripeOrder,
    onSuccess: (data) => {
      // Invalidate cart queries since order was placed
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Optionally invalidate orders list if you have one
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      console.error('Failed to confirm Stripe order:', error);
    },
  });
};

/**
 * Hook to get my orders with filters
 * @param params - Filter parameters for orders
 * @param options - React Query options
 */
export const useMyOrders = (
  params?: GetMyOrdersRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: ['orders', 'me', params],
    queryFn: () => getMyOrders(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
  });
};

/**
 * Hook to get order by ID
 * @param orderId - The order ID
 * @param options - React Query options
 */
export const useOrderById = (
  orderId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: (options?.enabled ?? true) && !!orderId,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, request }: { orderId: string; request?: CancelOrderRequest }) =>
      cancelOrder(orderId, request),
    onSuccess: (data, variables) => {
      // Invalidate the specific order query
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      
      // Invalidate the orders list
      queryClient.invalidateQueries({ queryKey: ['orders', 'me'] });
    },
    onError: (error: any) => {
      console.error('Failed to cancel order:', error);
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format order number for display
 */
export const formatOrderNumber = (orderNumber: string): string => {
  return orderNumber;
};

/**
 * Get order status color
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUCCEEDED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status: OrderStatus): string => {
  return status.replace(/_/g, ' ');
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (status: PaymentStatus): string => {
  return status.replace(/_/g, ' ');
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (order: OrderWithDetails): boolean => {
  return (
    order.status === 'PENDING' ||
    order.status === 'CONFIRMED' ||
    order.status === 'PROCESSING'
  );
};

/**
 * Calculate order item total
 */
export const calculateItemTotal = (item: OrderItemWithDetails): number => {
  return parseFloat(item.totalPrice);
};

/**
 * Get estimated delivery date
 */
export const getEstimatedDeliveryDate = (
  orderDate: string,
  deliveryType: DeliveryType = DeliveryType.STANDARD
): Date => {
  const date = new Date(orderDate);
  const daysToAdd = deliveryType === DeliveryType.EXPRESS ? 2 : 5;
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

/**
 * Format delivery type for display
 */
export const formatDeliveryType = (type: DeliveryType): string => {
  return type === DeliveryType.EXPRESS ? 'Express Delivery' : 'Standard Delivery';
};
