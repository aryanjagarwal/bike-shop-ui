// Bicycles API - TanStack Query hooks for bicycle endpoints
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { Bicycle, BicycleCategory, PaginatedResponse } from '@/lib/types/allTypes';

export type { Bicycle };

// ============================================
// Type Definitions
// ============================================

export interface GetAllBicyclesParams {
  page?: number;
  limit?: number;
  category?: BicycleCategory;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetBicyclesByCategoryParams {
  limit?: number;
}

export interface GetSimilarBicyclesParams {
  limit?: number;
}

export interface FeaturedBicyclesParams {
  limit?: number;
}

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

export interface BicycleWithDetails extends Bicycle {
  specifications?: any[];
  reviews?: any[];
  _count?: {
    reviews: number;
    wishlists: number;
  };
  priceBreakdown?: PriceBreakdown;
  averageRating?: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all bicycles with filters and pagination
 */
export const getAllBicycles = async (
  params?: GetAllBicyclesParams
): Promise<PaginatedResponse<Bicycle>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.brand) queryParams.append('brand', params.brand);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const endpoint = `/api/bicycles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<Bicycle>>(endpoint);
};

/**
 * Get bicycles by category
 */
export const getBicyclesByCategory = async (
  category: BicycleCategory,
  params?: GetBicyclesByCategoryParams
): Promise<ApiResponse<Bicycle[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const endpoint = `/api/bicycles/category/${category}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<ApiResponse<Bicycle[]>>(endpoint);
};

/**
 * Get bicycle by ID
 */
export const getBicycleById = async (
  id: string
): Promise<ApiResponse<BicycleWithDetails>> => {
  return apiClient.get<ApiResponse<BicycleWithDetails>>(`/api/bicycles/${id}`);
};

/**
 * Get similar bicycles
 */
export const getSimilarBicycles = async (
  id: string,
  params?: GetSimilarBicyclesParams
): Promise<ApiResponse<Bicycle[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const endpoint = `/api/bicycles/${id}/similar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<ApiResponse<Bicycle[]>>(endpoint);
};

/**
 * Get featured bicycles
 */
export const getFeaturedBicycles = async (
  params?: FeaturedBicyclesParams
): Promise<ApiResponse<Bicycle[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const endpoint = `/api/bicycles/featured${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<ApiResponse<Bicycle[]>>(endpoint);
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch all bicycles with filters and pagination
 * @param params - Filter and pagination parameters
 */
export const useAllBicycles = (params?: GetAllBicyclesParams) => {
  return useQuery({
    queryKey: ['bicycles', 'all', params],
    queryFn: () => getAllBicycles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch bicycles by category
 * @param category - Bicycle category
 * @param limit - Number of bicycles to fetch
 */
export const useBicyclesByCategory = (
  category: BicycleCategory,
  limit?: number
) => {
  return useQuery({
    queryKey: ['bicycles', 'category', category, limit],
    queryFn: () => getBicyclesByCategory(category, { limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch bicycle by ID
 * @param id - Bicycle ID
 */
export const useBicycle = (id: string) => {
  return useQuery({
    queryKey: ['bicycles', id],
    queryFn: () => getBicycleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch similar bicycles
 * @param id - Bicycle ID
 * @param limit - Number of similar bicycles to fetch (default: 6)
 */
export const useSimilarBicycles = (id: string, limit: number = 6) => {
  return useQuery({
    queryKey: ['bicycles', id, 'similar', limit],
    queryFn: () => getSimilarBicycles(id, { limit }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch featured bicycles
 * @param limit - Number of bicycles to fetch (default: 8)
 */
export const useFeaturedBicycles = (limit: number = 8) => {
  return useQuery({
    queryKey: ['bicycles', 'featured', limit],
    queryFn: () => getFeaturedBicycles({ limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
