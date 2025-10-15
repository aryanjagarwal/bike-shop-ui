// Cart API with TanStack Query hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { Cart, CartItem, Bicycle, Part } from '@/lib/types/allTypes';

// ============================================
// Types
// ============================================

export interface PriceBreakdown {
  netPrice: number;
  vatAmount: number;
  grossPrice: number;
  vatRate: number;
  vatRatePercentage: number;
  formatted: {
    netPrice: string;
    vatAmount: string;
    grossPrice: string;
  };
  currency: string;
}

export interface CartItemWithDetails extends CartItem {
  bicycle?: Bicycle & {
    images?: Array<{
      id: string;
      bicycleId: string;
      cloudinaryUrl: string;
      publicId: string;
      altText: string | null;
      isPrimary: boolean;
      sortOrder: number;
      createdAt: string;
    }>;
  };
  part?: Part;
  itemTotal: number;
  priceBreakdown: PriceBreakdown;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  netAmount: number;
  vatAmount: number;
  total: number;
  currency: string;
  formatted: {
    subtotal: string;
    netAmount: string;
    vatAmount: string;
    total: string;
  };
}

export interface CartWithDetails extends Cart {
  items: CartItemWithDetails[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  bicycleId?: string;
  partId?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface GetCartResponse {
  success: boolean;
  data: CartWithDetails;
}

export interface CartCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Get user's cart
 */
export const getCart = async (): Promise<GetCartResponse> => {
  return apiClient.get<GetCartResponse>('/api/cart');
};

/**
 * Add item to cart
 */
export const addToCart = async (data: AddToCartRequest): Promise<ApiResponse<CartWithDetails>> => {
  return apiClient.post<ApiResponse<CartWithDetails>>('/api/cart', data);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  itemId: string,
  data: UpdateCartItemRequest
): Promise<ApiResponse<CartWithDetails>> => {
  return apiClient.patch<ApiResponse<CartWithDetails>>(`/api/cart/items/${itemId}`, data);
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (itemId: string): Promise<ApiResponse<CartWithDetails>> => {
  return apiClient.delete<ApiResponse<CartWithDetails>>(`/api/cart/items/${itemId}`);
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<ApiResponse<{ items: []; summary: CartSummary }>> => {
  return apiClient.delete<ApiResponse<{ items: []; summary: CartSummary }>>('/api/cart');
};

/**
 * Get cart item count
 */
export const getCartCount = async (): Promise<CartCountResponse> => {
  return apiClient.get<CartCountResponse>('/api/cart/count');
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch user's cart
 */
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

/**
 * Hook to fetch cart count
 */
export const useCartCount = () => {
  return useQuery({
    queryKey: ['cart', 'count'],
    queryFn: getCartCount,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Hook to add item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // Invalidate cart queries to refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Hook to update cart item quantity
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Hook to remove item from cart
 */
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Hook to clear cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
