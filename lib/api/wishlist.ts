// Wishlist API with TanStack Query hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { Wishlist, Bicycle } from '@/lib/types/allTypes';

// ============================================
// Types
// ============================================

export interface WishlistItem extends Wishlist {
  bicycle?: Bicycle;
}

export interface GetWishlistResponse {
  success: boolean;
  data: WishlistItem[];
  count: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Add bicycle to wishlist
 */
export const addToWishlist = async (
  bicycleId: string
): Promise<ApiResponse<void>> => {
  return apiClient.post<ApiResponse<void>>(
    `/api/bicycles/${bicycleId}/wishlist`
  );
};

/**
 * Remove bicycle from wishlist
 */
export const removeFromWishlist = async (
  bicycleId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(
    `/api/bicycles/${bicycleId}/wishlist`
  );
};

/**
 * Get user's wishlist
 */
export const getMyWishlist = async (): Promise<GetWishlistResponse> => {
  return apiClient.get<GetWishlistResponse>('/api/bicycles/wishlist/me');
};

/**
 * Check if bicycle is in wishlist
 */
export const isInWishlist = async (
  bicycleId: string
): Promise<ApiResponse<{ isInWishlist: boolean }>> => {
  return apiClient.get<ApiResponse<{ isInWishlist: boolean }>>(
    `/api/bicycles/${bicycleId}/wishlist/check`
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to get user's wishlist
 */
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: getMyWishlist,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to add item to wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bicycleId: string) => addToWishlist(bicycleId),
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      console.error('Failed to add to wishlist:', error);
    },
  });
};

/**
 * Hook to remove item from wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bicycleId: string) => removeFromWishlist(bicycleId),
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      console.error('Failed to remove from wishlist:', error);
    },
  });
};

/**
 * Hook to toggle wishlist status
 */
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bicycleId,
      isInWishlist,
    }: {
      bicycleId: string;
      isInWishlist: boolean;
    }) => {
      if (isInWishlist) {
        return removeFromWishlist(bicycleId);
      } else {
        return addToWishlist(bicycleId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      console.error('Failed to toggle wishlist:', error);
    },
  });
};
