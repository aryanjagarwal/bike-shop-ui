// Admin Parts API - TanStack Query hooks for admin parts management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '../client';
import type { Part, PartImage, PartCategory } from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

export interface CreatePartCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string;
  isActive?: boolean;
}

export interface UpdatePartCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  parentCategoryId?: string;
  isActive?: boolean;
}

export interface CreatePartRequest {
  name: string;
  brand: string;
  model?: string;
  partCategoryId: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  weight?: string;
  warrantyPeriod?: string;
  installationDifficulty: 'EASY' | 'MEDIUM' | 'ADVANCED' | 'PROFESSIONAL';
  isFeatured?: boolean;
  isActive?: boolean;
  compatibleBicycles?: string[];
  specifications?: Array<{
    specName: string;
    specValue: string;
    specCategory?: string;
  }>;
}

export interface UpdatePartRequest {
  name?: string;
  brand?: string;
  model?: string;
  partCategoryId?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  sku?: string;
  weight?: string;
  warrantyPeriod?: string;
  installationDifficulty?: 'EASY' | 'MEDIUM' | 'ADVANCED' | 'PROFESSIONAL';
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdatePartStockRequest {
  stockQuantity: number;
  reason?: string;
}

export interface AddCompatibilityRequest {
  bicycleId: string;
  compatibilityNotes?: string;
}

export interface BulkAddCompatibilityRequest {
  bicycleIds: string[];
}

export interface UpdateCompatibilityRequest {
  isCompatible?: boolean;
  compatibilityNotes?: string;
}

export interface CompatibilityResponse {
  id: string;
  partId: string;
  bicycleId: string;
  isCompatible: boolean;
  compatibilityNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BulkCompatibilityResponse {
  success: boolean;
  added: number;
}

export interface GetAllPartsParams {
  page?: number;
  limit?: number;
  brand?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Part Category API Functions
// ============================================

/**
 * Create a new part category
 */
export const createPartCategory = async (
  data: CreatePartCategoryRequest
): Promise<ApiResponse<PartCategory>> => {
  return apiClient.post<ApiResponse<PartCategory>>('/api/part-categories', data);
};

/**
 * Get all part categories
 */
export const getAllPartCategories = async (): Promise<ApiResponse<PartCategory[]>> => {
  return apiClient.get<ApiResponse<PartCategory[]>>('/api/part-categories');
};

/**
 * Get part category by ID
 */
export const getPartCategoryById = async (id: string): Promise<ApiResponse<PartCategory>> => {
  return apiClient.get<ApiResponse<PartCategory>>(`/api/part-categories/${id}`);
};

/**
 * Update part category
 */
export const updatePartCategory = async (
  id: string,
  data: UpdatePartCategoryRequest
): Promise<ApiResponse<PartCategory>> => {
  return apiClient.put<ApiResponse<PartCategory>>(`/api/part-categories/${id}`, data);
};

/**
 * Delete part category
 */
export const deletePartCategory = async (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/api/part-categories/${id}`);
};

// ============================================
// Part API Functions
// ============================================

/**
 * Create a new part
 */
export const createPart = async (
  data: CreatePartRequest
): Promise<ApiResponse<Part>> => {
  return apiClient.post<ApiResponse<Part>>('/api/parts', data);
};

/**
 * Get all parts with filters
 */
export const getAllParts = async (
  params?: GetAllPartsParams
): Promise<ApiResponse<Part[]>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.brand) queryParams.append('brand', params.brand);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.inStockOnly) queryParams.append('inStockOnly', 'true');
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/parts?${queryString}` : '/api/parts';
  
  return apiClient.get<ApiResponse<Part[]>>(endpoint);
};

/**
 * Get part by ID
 */
export const getPartById = async (id: string): Promise<ApiResponse<Part>> => {
  return apiClient.get<ApiResponse<Part>>(`/api/parts/${id}`);
};

/**
 * Update part
 */
export const updatePart = async (
  id: string,
  data: UpdatePartRequest
): Promise<ApiResponse<Part>> => {
  return apiClient.put<ApiResponse<Part>>(`/api/parts/${id}`, data);
};

/**
 * Update part stock
 */
export const updatePartStock = async (
  id: string,
  data: UpdatePartStockRequest
): Promise<ApiResponse<Part>> => {
  return apiClient.patch<ApiResponse<Part>>(`/api/parts/${id}/stock`, data);
};

/**
 * Delete part (soft delete)
 */
export const deletePart = async (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/api/parts/${id}`);
};

// ============================================
// Part Compatibility API Functions
// ============================================

/**
 * Add single compatibility
 */
export const addPartCompatibility = async (
  partId: string,
  data: AddCompatibilityRequest
): Promise<ApiResponse<CompatibilityResponse>> => {
  return apiClient.post<ApiResponse<CompatibilityResponse>>(
    `/api/parts/${partId}/compatibility`,
    data
  );
};

/**
 * Bulk add compatibility
 */
export const bulkAddPartCompatibility = async (
  partId: string,
  data: BulkAddCompatibilityRequest
): Promise<ApiResponse<BulkCompatibilityResponse>> => {
  return apiClient.post<ApiResponse<BulkCompatibilityResponse>>(
    `/api/parts/${partId}/compatibility/bulk`,
    data
  );
};

/**
 * Get compatible bicycles for a part
 */
export const getPartCompatibleBicycles = async (
  partId: string
): Promise<ApiResponse<any[]>> => {
  return apiClient.get<ApiResponse<any[]>>(`/api/parts/${partId}/compatibility`);
};

/**
 * Update compatibility
 */
export const updatePartCompatibility = async (
  partId: string,
  bicycleId: string,
  data: UpdateCompatibilityRequest
): Promise<ApiResponse<CompatibilityResponse>> => {
  return apiClient.patch<ApiResponse<CompatibilityResponse>>(
    `/api/parts/${partId}/compatibility/${bicycleId}`,
    data
  );
};

/**
 * Remove compatibility
 */
export const removePartCompatibility = async (
  partId: string,
  bicycleId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(
    `/api/parts/${partId}/compatibility/${bicycleId}`
  );
};

// ============================================
// Part Image API Functions
// ============================================

/**
 * Upload part images
 */
export const uploadPartImages = async (
  partId: string,
  images: File[],
  isPrimary?: boolean
): Promise<ApiResponse<PartImage[]>> => {
  const formData = new FormData();
  
  images.forEach((image) => {
    formData.append('images', image);
  });
  
  if (isPrimary !== undefined) {
    formData.append('isPrimary', isPrimary.toString());
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/parts/${partId}/images`,
    {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(errorData.message || 'Failed to upload images');
  }
  
  return await response.json();
};

/**
 * Delete part image
 */
export const deletePartImage = async (
  partId: string,
  imageId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/api/parts/${partId}/images/${imageId}`);
};

// ============================================
// TanStack Query Hooks - Part Categories
// ============================================

/**
 * Hook to create part category
 */
export const useCreatePartCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePartCategoryRequest) => createPartCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'part-categories'] });
    },
  });
};

/**
 * Hook to get all part categories
 */
export const useAdminPartCategories = () => {
  return useQuery({
    queryKey: ['admin', 'part-categories'],
    queryFn: () => getAllPartCategories(),
  });
};

/**
 * Hook to get part category by ID
 */
export const useAdminPartCategory = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'part-categories', id],
    queryFn: () => getPartCategoryById(id),
    enabled: !!id,
  });
};

/**
 * Hook to update part category
 */
export const useUpdatePartCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartCategoryRequest }) =>
      updatePartCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'part-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'part-categories', variables.id] });
    },
  });
};

/**
 * Hook to delete part category
 */
export const useDeletePartCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deletePartCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'part-categories'] });
    },
  });
};

// ============================================
// TanStack Query Hooks - Parts
// ============================================

/**
 * Hook to create part
 */
export const useCreatePart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePartRequest) => createPart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
};

/**
 * Hook to get all parts with filters
 */
export const useAdminParts = (params?: GetAllPartsParams) => {
  return useQuery({
    queryKey: ['admin', 'parts', params],
    queryFn: () => getAllParts(params),
  });
};

/**
 * Hook to get part by ID
 */
export const useAdminPart = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'parts', id],
    queryFn: () => getPartById(id),
    enabled: !!id,
  });
};

/**
 * Hook to update part
 */
export const useUpdatePart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartRequest }) =>
      updatePart(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.id] });
    },
  });
};

/**
 * Hook to update part stock
 */
export const useUpdatePartStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartStockRequest }) =>
      updatePartStock(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.id] });
    },
  });
};

/**
 * Hook to delete part
 */
export const useDeletePart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
};

// ============================================
// TanStack Query Hooks - Part Compatibility
// ============================================

/**
 * Hook to add single compatibility
 */
export const useAddPartCompatibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partId, data }: { partId: string; data: AddCompatibilityRequest }) =>
      addPartCompatibility(partId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.partId, 'compatibility'] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.partId, 'compatible-bicycles'] });
    },
  });
};

/**
 * Hook to bulk add compatibility
 */
export const useBulkAddPartCompatibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partId, data }: { partId: string; data: BulkAddCompatibilityRequest }) =>
      bulkAddPartCompatibility(partId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.partId, 'compatibility'] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.partId, 'compatible-bicycles'] });
    },
  });
};

/**
 * Hook to get compatible bicycles
 */
export const usePartCompatibleBicycles = (partId: string) => {
  return useQuery({
    queryKey: ['admin', 'parts', partId, 'compatibility'],
    queryFn: () => getPartCompatibleBicycles(partId),
    enabled: !!partId,
  });
};

/**
 * Hook to update compatibility
 */
export const useUpdatePartCompatibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      partId, 
      bicycleId, 
      data 
    }: { 
      partId: string; 
      bicycleId: string; 
      data: UpdateCompatibilityRequest 
    }) => updatePartCompatibility(partId, bicycleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.partId, 'compatibility'] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.partId, 'compatible-bicycles'] });
    },
  });
};

/**
 * Hook to remove compatibility
 */
export const useRemovePartCompatibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partId, bicycleId }: { partId: string; bicycleId: string }) =>
      removePartCompatibility(partId, bicycleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.partId, 'compatibility'] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.partId, 'compatible-bicycles'] });
    },
  });
};

// ============================================
// TanStack Query Hooks - Part Images
// ============================================

/**
 * Hook to upload part images
 */
export const useUploadPartImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      partId, 
      images, 
      isPrimary 
    }: { 
      partId: string; 
      images: File[]; 
      isPrimary?: boolean 
    }) => uploadPartImages(partId, images, isPrimary),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.partId] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.partId] });
    },
  });
};

/**
 * Hook to delete part image
 */
export const useDeletePartImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partId, imageId }: { partId: string; imageId: string }) =>
      deletePartImage(partId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parts', variables.partId] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.partId] });
    },
  });
};
