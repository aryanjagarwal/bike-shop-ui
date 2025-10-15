// Admin Coupons API - TanStack Query hooks for admin coupon management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '../client';
import type { Coupon, UserCoupon, DiscountType, User } from '@/lib/types/allTypes';

export type { Coupon, UserCoupon };

// ============================================
// Type Definitions
// ============================================

export interface CouponWithCounts extends Coupon {
  _count: {
    orderCoupons: number;
    userCoupons: number;
  };
}

export interface UserWithProfile extends User {
  profile: {
    id: string;
    userId: string;
    dateOfBirth: string | null;
    preferences: string;
    createdAt: string;
    updatedAt: string;
  };
  _count: {
    orders: number;
    serviceBookings: number;
    reviews: number;
  };
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
}

export interface UpdateCouponRequest {
  code?: string;
  name?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
}

export interface GetAllCouponsParams {
  includeInactive?: boolean;
}

export interface GetAllCouponsResponse {
  success: boolean;
  data: CouponWithCounts[];
  count: number;
}

export interface CreateCouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface UpdateCouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface DeleteCouponResponse {
  success: boolean;
  message: string;
}

export interface CouponStatsResponse {
  success: boolean;
  data: {
    coupon: Coupon & {
      orderCoupons: Array<{
        id: string;
        orderId: string;
        couponId: string;
        discountAmount: string;
        appliedAt: string;
      }>;
      userCoupons: Array<{
        id: string;
        userId: string;
        couponId: string;
        issuedAt: string;
        isRedeemed: boolean;
        redeemedAt: string | null;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      }>;
    };
    stats: {
      totalUsed: number;
      remainingUses: number;
      totalDiscountGiven: number;
      totalAssigned: number;
      totalRedeemed: number;
      recentOrders: any[];
    };
  };
}

export interface AssignCouponRequest {
  couponId: string;
  userId: string;
}

export interface AssignCouponResponse {
  success: boolean;
  message: string;
  data: UserCoupon;
}

export interface AssignMultipleCouponsRequest {
  couponId: string;
  userIds: string[];
}

export interface AssignMultipleCouponsResponse {
  success: boolean;
  message: string;
  data: {
    assignedCount: number;
    skippedCount: number;
  };
}

export interface AssignAllCouponsRequest {
  couponId: string;
}

export interface AssignAllCouponsResponse {
  success: boolean;
  message: string;
  data: {
    assignedCount: number;
    totalUsers: number;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'CUSTOMER' | 'ADMIN' | 'TECHNICIAN';
  search?: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: UserWithProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Get all coupons (admin)
 */
export const getAllCoupons = async (
  params?: GetAllCouponsParams
): Promise<GetAllCouponsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.includeInactive !== undefined) {
    queryParams.append('includeInactive', String(params.includeInactive));
  }
  
  const endpoint = `/api/coupons/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<GetAllCouponsResponse>(endpoint);
};

/**
 * Create a new coupon
 */
export const createCoupon = async (
  request: CreateCouponRequest
): Promise<CreateCouponResponse> => {
  return apiClient.post<CreateCouponResponse>('/api/coupons', request);
};

/**
 * Update a coupon
 */
export const updateCoupon = async (
  couponId: string,
  request: UpdateCouponRequest
): Promise<UpdateCouponResponse> => {
  return apiClient.put<UpdateCouponResponse>(`/api/coupons/${couponId}`, request);
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (
  couponId: string
): Promise<DeleteCouponResponse> => {
  return apiClient.delete<DeleteCouponResponse>(`/api/coupons/${couponId}`);
};

/**
 * Get coupon statistics
 */
export const getCouponStats = async (
  couponId: string
): Promise<CouponStatsResponse> => {
  return apiClient.get<CouponStatsResponse>(`/api/coupons/${couponId}/stats`);
};

/**
 * Assign coupon to a single user
 */
export const assignCoupon = async (
  request: AssignCouponRequest
): Promise<AssignCouponResponse> => {
  return apiClient.post<AssignCouponResponse>('/api/coupons/assign', request);
};

/**
 * Assign coupon to multiple users
 */
export const assignMultipleCoupons = async (
  request: AssignMultipleCouponsRequest
): Promise<AssignMultipleCouponsResponse> => {
  return apiClient.post<AssignMultipleCouponsResponse>('/api/coupons/assign-multiple', request);
};

/**
 * Assign coupon to all users
 */
export const assignAllCoupons = async (
  request: AssignAllCouponsRequest
): Promise<AssignAllCouponsResponse> => {
  return apiClient.post<AssignAllCouponsResponse>('/api/coupons/assign-all', request);
};

/**
 * Get all users with filters
 */
export const getUsers = async (
  params?: GetUsersParams
): Promise<GetUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.role) queryParams.append('role', params.role);
  if (params?.search) queryParams.append('search', params.search);
  
  const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<GetUsersResponse>(endpoint);
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch all coupons
 */
export const useGetAllCoupons = (params?: GetAllCouponsParams) => {
  return useQuery({
    queryKey: ['admin', 'coupons', 'all', params],
    queryFn: () => getAllCoupons(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to create a coupon
 */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCouponRequest) => createCoupon(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create coupon:', error);
    },
  });
};

/**
 * Hook to update a coupon
 */
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, request }: { couponId: string; request: UpdateCouponRequest }) =>
      updateCoupon(couponId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update coupon:', error);
    },
  });
};

/**
 * Hook to delete a coupon
 */
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete coupon:', error);
    },
  });
};

/**
 * Hook to fetch coupon statistics
 */
export const useGetCouponStats = (couponId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['admin', 'coupons', couponId, 'stats'],
    queryFn: () => getCouponStats(couponId),
    enabled: enabled && !!couponId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

/**
 * Hook to assign coupon to a single user
 */
export const useAssignCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignCouponRequest) => assignCoupon(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error: Error) => {
      console.error('Failed to assign coupon:', error);
    },
  });
};

/**
 * Hook to assign coupon to multiple users
 */
export const useAssignMultipleCoupons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignMultipleCouponsRequest) => assignMultipleCoupons(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error: Error) => {
      console.error('Failed to assign coupons to multiple users:', error);
    },
  });
};

/**
 * Hook to assign coupon to all users
 */
export const useAssignAllCoupons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignAllCouponsRequest) => assignAllCoupons(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error: Error) => {
      console.error('Failed to assign coupon to all users:', error);
    },
  });
};

/**
 * Hook to fetch users with filters
 */
export const useGetUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};
