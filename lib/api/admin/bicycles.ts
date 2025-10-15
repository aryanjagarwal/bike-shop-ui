// Admin Bicycles API - TanStack Query hooks for admin bicycle management
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '../client';
import type { Bicycle, BicycleImage, CreateBicycleInput, UpdateBicycleInput } from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

export interface CreateBicycleRequest {
  name: string;
  brand: string;
  model: string;
  year: string;
  category: string;
  frameSize: string;
  frameMaterial: string;
  color: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight?: string;
  warrantyPeriod?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateBicycleRequest {
  name?: string;
  brand?: string;
  model?: string;
  year?: string;
  category?: string;
  frameSize?: string;
  frameMaterial?: string;
  color?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  weight?: string;
  warrantyPeriod?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateStockRequest {
  stockQuantity: number;
  reason?: string;
}

export interface UploadImagesRequest {
  images: File[];
  isPrimary?: boolean;
}

export interface UploadImagesResponse {
  success: boolean;
  message: string;
  data: BicycleImage[];
}

// ============================================
// API Functions
// ============================================

/**
 * Create a new bicycle
 */
export const createBicycle = async (
  data: CreateBicycleRequest
): Promise<ApiResponse<Bicycle>> => {
  return apiClient.post<ApiResponse<Bicycle>>('/api/bicycles', data);
};

/**
 * Update a bicycle
 */
export const updateBicycle = async (
  id: string,
  data: UpdateBicycleRequest
): Promise<ApiResponse<Bicycle>> => {
  return apiClient.put<ApiResponse<Bicycle>>(`/api/bicycles/${id}`, data);
};

/**
 * Update bicycle stock
 */
export const updateBicycleStock = async (
  id: string,
  data: UpdateStockRequest
): Promise<ApiResponse<Bicycle>> => {
  return apiClient.put<ApiResponse<Bicycle>>(`/api/bicycles/${id}`, data);
};

/**
 * Delete a bicycle (soft delete - makes it inactive)
 */
export const deleteBicycle = async (
  id: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/api/bicycles/${id}`);
};

/**
 * Upload images for a bicycle
 */
export const uploadBicycleImages = async (
  bicycleId: string,
  data: UploadImagesRequest
): Promise<UploadImagesResponse> => {
  const formData = new FormData();
  
  data.images.forEach((image) => {
    formData.append('images', image);
  });
  
  if (data.isPrimary !== undefined) {
    formData.append('isPrimary', data.isPrimary.toString());
  }
  
  // Use fetch directly for FormData to avoid Content-Type issues
  const token = (await import('../tokenStorage')).tokenStorage.getToken();
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  
  const response = await fetch(`${API_BASE_URL}/api/bicycles/${bicycleId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(errorData.message || 'Upload failed');
  }
  
  return await response.json();
};

/**
 * Delete a bicycle image
 */
export const deleteBicycleImage = async (
  bicycleId: string,
  imageId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(
    `/api/bicycles/${bicycleId}/images/${imageId}`
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to create a bicycle
 */
export const useCreateBicycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBicycleRequest) => createBicycle(data),
    onSuccess: () => {
      // Invalidate bicycles list to refetch
      queryClient.invalidateQueries({ queryKey: ['bicycles'] });
    },
  });
};

/**
 * Hook to update a bicycle
 */
export const useUpdateBicycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBicycleRequest }) =>
      updateBicycle(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific bicycle and list
      queryClient.invalidateQueries({ queryKey: ['bicycles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bicycles'] });
    },
  });
};

/**
 * Hook to update bicycle stock
 */
export const useUpdateBicycleStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockRequest }) =>
      updateBicycleStock(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific bicycle and list
      queryClient.invalidateQueries({ queryKey: ['bicycles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bicycles'] });
    },
  });
};

/**
 * Hook to delete a bicycle
 */
export const useDeleteBicycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteBicycle(id),
    onSuccess: () => {
      // Invalidate bicycles list
      queryClient.invalidateQueries({ queryKey: ['bicycles'] });
    },
  });
};

/**
 * Hook to upload bicycle images
 */
export const useUploadBicycleImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bicycleId, data }: { bicycleId: string; data: UploadImagesRequest }) =>
      uploadBicycleImages(bicycleId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific bicycle to refetch with new images
      queryClient.invalidateQueries({ queryKey: ['bicycles', variables.bicycleId] });
    },
  });
};

/**
 * Hook to delete a bicycle image
 */
export const useDeleteBicycleImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bicycleId, imageId }: { bicycleId: string; imageId: string }) =>
      deleteBicycleImage(bicycleId, imageId),
    onSuccess: (_, variables) => {
      // Invalidate specific bicycle to refetch without deleted image
      queryClient.invalidateQueries({ queryKey: ['bicycles', variables.bicycleId] });
    },
  });
};
