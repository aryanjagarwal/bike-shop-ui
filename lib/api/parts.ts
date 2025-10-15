// Parts API - TanStack Query hooks for parts endpoints
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { Part, PartCategory, Bicycle, InstallationLevel, PaginatedResponse } from '@/lib/types/allTypes';

export type { Part, PartCategory };

// ============================================
// Type Definitions
// ============================================

export interface GetAllPartsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetPartsByCategoryParams {
  limit?: number;
}

export interface FeaturedPartsParams {
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

export interface PartWithDetails extends Part {
  specifications?: any[];
  reviews?: any[];
  category?: PartCategory;
  bicycleCompatibility?: Array<{
    id: string;
    partId: string;
    bicycleId: string;
    isCompatible: boolean;
    compatibilityNotes: string | null;
    createdAt: string;
    updatedAt: string;
    bicycle: Bicycle & {
      images: any[];
    };
  }>;
  _count?: {
    reviews: number;
    wishlists: number;
  };
  priceBreakdown?: PriceBreakdown;
  averageRating?: number;
  compatibleBicycles?: Array<Bicycle & { images: any[] }>;
}

export interface PartCategoryWithCount extends PartCategory {
  _count?: {
    parts: number;
  };
  childCategories?: PartCategory[];
}

export interface CompatiblePart extends Omit<Part, 'category'> {
  images: any[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  priceBreakdown?: PriceBreakdown;
}

export interface CompatibleBicycle extends Bicycle {
  images: any[];
  compatibilityNotes?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all parts with filters and pagination
 */
export const getAllParts = async (
  params?: GetAllPartsParams
): Promise<PaginatedResponse<PartWithDetails>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.brand) queryParams.append('brand', params.brand);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.inStockOnly !== undefined) queryParams.append('inStockOnly', params.inStockOnly.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const endpoint = `/api/parts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<PartWithDetails>>(endpoint);
};

/**
 * Get part by ID
 */
export const getPartById = async (
  id: string
): Promise<ApiResponse<PartWithDetails>> => {
  return apiClient.get<ApiResponse<PartWithDetails>>(`/api/parts/${id}`);
};

/**
 * Get featured parts
 */
export const getFeaturedParts = async (
  params?: FeaturedPartsParams
): Promise<ApiResponse<PartWithDetails[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const endpoint = `/api/parts/featured${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<ApiResponse<PartWithDetails[]>>(endpoint);
};

/**
 * Get all part categories
 */
export const getAllPartCategories = async (): Promise<ApiResponse<PartCategoryWithCount[]>> => {
  return apiClient.get<ApiResponse<PartCategoryWithCount[]>>('/api/part-categories');
};

/**
 * Get part category by ID
 */
export const getPartCategoryById = async (
  id: string
): Promise<ApiResponse<PartCategoryWithCount>> => {
  return apiClient.get<ApiResponse<PartCategoryWithCount>>(`/api/part-categories/${id}`);
};

/**
 * Get parts by category ID
 */
export const getPartsByCategory = async (
  categoryId: string,
  params?: GetPartsByCategoryParams
): Promise<ApiResponse<PartWithDetails[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const endpoint = `/api/parts/category/${categoryId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<ApiResponse<PartWithDetails[]>>(endpoint);
};

/**
 * Get part categories (alternative endpoint)
 */
export const getPartCategories = async (): Promise<ApiResponse<PartCategoryWithCount[]>> => {
  return apiClient.get<ApiResponse<PartCategoryWithCount[]>>('/api/parts/categories');
};

/**
 * Get compatible parts for a bicycle
 */
export const getCompatiblePartsByBicycleId = async (
  bicycleId: string
): Promise<ApiResponse<CompatiblePart[]>> => {
  return apiClient.get<ApiResponse<CompatiblePart[]>>(`/api/bicycles/${bicycleId}/compatible`);
};

/**
 * Get compatible bicycles for a part
 */
export const getCompatibleBicyclesByPartId = async (
  partId: string
): Promise<ApiResponse<CompatibleBicycle[]> & { count?: number }> => {
  return apiClient.get<ApiResponse<CompatibleBicycle[]> & { count?: number }>(`/api/parts/${partId}/compatibility`);
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch all parts with filters and pagination
 * @param params - Filter and pagination parameters
 */
export const useAllParts = (params?: GetAllPartsParams) => {
  return useQuery({
    queryKey: ['parts', 'all', params],
    queryFn: () => getAllParts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch part by ID
 * @param id - Part ID
 */
export const usePart = (id: string) => {
  return useQuery({
    queryKey: ['parts', id],
    queryFn: () => getPartById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch featured parts
 * @param limit - Number of parts to fetch (default: 8)
 */
export const useFeaturedParts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['parts', 'featured', limit],
    queryFn: () => getFeaturedParts({ limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch all part categories
 */
export const usePartCategories = () => {
  return useQuery({
    queryKey: ['part-categories', 'all'],
    queryFn: () => getAllPartCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    retry: 2,
  });
};

/**
 * Hook to fetch part category by ID
 * @param id - Category ID
 */
export const usePartCategory = (id: string) => {
  return useQuery({
    queryKey: ['part-categories', id],
    queryFn: () => getPartCategoryById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch parts by category ID
 * @param categoryId - Category ID
 * @param limit - Number of parts to fetch
 */
export const usePartsByCategory = (categoryId: string, limit?: number) => {
  return useQuery({
    queryKey: ['parts', 'category', categoryId, limit],
    queryFn: () => getPartsByCategory(categoryId, { limit }),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch compatible parts for a bicycle
 * @param bicycleId - Bicycle ID
 */
export const useCompatibleParts = (bicycleId: string) => {
  return useQuery({
    queryKey: ['bicycles', bicycleId, 'compatible-parts'],
    queryFn: () => getCompatiblePartsByBicycleId(bicycleId),
    enabled: !!bicycleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch compatible bicycles for a part
 * @param partId - Part ID
 */
export const useCompatibleBicycles = (partId: string) => {
  return useQuery({
    queryKey: ['parts', partId, 'compatible-bicycles'],
    queryFn: () => getCompatibleBicyclesByPartId(partId),
    enabled: !!partId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
