// Coupons API - TanStack Query hooks for coupon endpoints
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { UserCoupon, DiscountType } from '@/lib/types/allTypes';

export type { UserCoupon };

// ============================================
// Type Definitions
// ============================================

export interface AvailableCouponsResponse {
  success: boolean;
  data: UserCoupon[];
  count: number;
}

export interface ApplyCouponRequest {
  couponId: string;
  cartTotal: number;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  data: {
    couponId: string;
    couponCode: string;
    discountAmount: number;
    discountType: DiscountType;
    finalAmount: number;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Get available coupons for the current user
 */
export const getAvailableCoupons = async (): Promise<AvailableCouponsResponse> => {
  return apiClient.get<AvailableCouponsResponse>('/api/coupons/available');
};

/**
 * Apply a coupon to calculate discount
 */
export const applyCoupon = async (
  request: ApplyCouponRequest
): Promise<ApplyCouponResponse> => {
  return apiClient.post<ApplyCouponResponse>('/api/coupons/apply', request);
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch available coupons for the current user
 */
export const useAvailableCoupons = () => {
  return useQuery({
    queryKey: ['coupons', 'available'],
    queryFn: getAvailableCoupons,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to apply a coupon
 */
export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApplyCouponRequest) => applyCoupon(request),
    onSuccess: () => {
      // Optionally invalidate coupons query if needed
      queryClient.invalidateQueries({ queryKey: ['coupons', 'available'] });
    },
    onError: (error: Error) => {
      console.error('Failed to apply coupon:', error);
    },
  });
};
