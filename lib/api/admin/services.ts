// Admin Service Management API - TanStack Query hooks for admin service operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '../client';
import { BookingStatus, PaymentStatus } from '@/lib/types/allTypes';
import type { 
  Service, 
  ServiceCategory, 
  ServiceBooking
} from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

export interface AdminServiceBooking extends Omit<ServiceBooking, 'user' | 'service' | 'images' | 'technician' | 'payments'> {
  service: ServiceWithCategory;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  images: Array<{
    id: string;
    cloudinaryUrl: string;
    publicId: string;
    description: string | null;
  }>;
  technician: {
    id: string;
    technicianId: string;
    assignedAt: string;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  payments?: Array<{
    id: string;
    amount: string;
    status: PaymentStatus;
    createdAt: string;
  }>;
}

export interface GetAllBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
  serviceId?: string;
}

export interface GetAllBookingsResponse {
  success: boolean;
  data: AdminServiceBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UpdateBookingStatusRequest {
  status?: BookingStatus;
  technicianNotes?: string;
  quotedPrice?: number;
  finalPrice?: number;
}

export interface UpdateBookingStatusResponse {
  success: boolean;
  message: string;
  data: AdminServiceBooking;
}

export interface CreateServiceCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateServiceCategoryResponse {
  success: boolean;
  message: string;
  data: ServiceCategory & { services: Service[] };
}

export interface UpdateServiceCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateServiceCategoryResponse {
  success: boolean;
  message: string;
  data: ServiceCategory & { services: Service[] };
}

export interface GetAllServicesParams {
  categoryId?: string;
  includeInactive?: boolean;
}

export interface CreateServiceRequest {
  name: string;
  serviceCategoryId: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  requiresDiagnosis?: boolean;
}

export interface CreateServiceResponse {
  success: boolean;
  message: string;
  data: ServiceWithCategory;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  isActive?: boolean;
  requiresDiagnosis?: boolean;
}

export interface UpdateServiceResponse {
  success: boolean;
  message: string;
  data: ServiceWithCategory;
}

// ============================================
// API Functions - Bookings
// ============================================

/**
 * Get all service bookings (admin)
 */
export const getAllBookings = async (
  params?: GetAllBookingsParams
): Promise<GetAllBookingsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.serviceId) queryParams.append('serviceId', params.serviceId);

  const queryString = queryParams.toString();
  const endpoint = `/api/service-bookings${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get<GetAllBookingsResponse>(endpoint);
};

/**
 * Update booking status (admin)
 */
export const updateBookingStatus = async (
  bookingId: string,
  data: UpdateBookingStatusRequest
): Promise<UpdateBookingStatusResponse> => {
  return apiClient.patch<UpdateBookingStatusResponse>(
    `/api/service-bookings/${bookingId}/status`,
    data
  );
};

// ============================================
// API Functions - Service Categories
// ============================================

/**
 * Create service category (admin)
 */
export const createServiceCategory = async (
  data: CreateServiceCategoryRequest
): Promise<CreateServiceCategoryResponse> => {
  return apiClient.post<CreateServiceCategoryResponse>(
    '/api/services/categories',
    data
  );
};

/**
 * Update service category (admin)
 */
export const updateServiceCategory = async (
  categoryId: string,
  data: UpdateServiceCategoryRequest
): Promise<UpdateServiceCategoryResponse> => {
  return apiClient.patch<UpdateServiceCategoryResponse>(
    `/api/services/categories/${categoryId}`,
    data
  );
};

/**
 * Delete service category (admin)
 */
export const deleteServiceCategory = async (
  categoryId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(
    `/api/services/categories/${categoryId}`
  );
};

// ============================================
// API Functions - Services
// ============================================

/**
 * Get all services with filters (admin)
 */
export const getAllServices = async (
  params?: GetAllServicesParams
): Promise<ApiResponse<ServiceWithCategory[]>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.includeInactive !== undefined) {
    queryParams.append('includeInactive', params.includeInactive.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/services/admin/all${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get<ApiResponse<ServiceWithCategory[]>>(endpoint);
};

/**
 * Create service (admin)
 */
export const createService = async (
  data: CreateServiceRequest
): Promise<CreateServiceResponse> => {
  return apiClient.post<CreateServiceResponse>('/api/services', data);
};

/**
 * Update service (admin)
 */
export const updateService = async (
  serviceId: string,
  data: UpdateServiceRequest
): Promise<UpdateServiceResponse> => {
  return apiClient.patch<UpdateServiceResponse>(
    `/api/services/${serviceId}`,
    data
  );
};

/**
 * Delete service (admin)
 */
export const deleteService = async (
  serviceId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/api/services/${serviceId}`);
};

/**
 * Toggle service active status (admin)
 */
export const toggleServiceStatus = async (
  serviceId: string
): Promise<UpdateServiceResponse> => {
  return apiClient.patch<UpdateServiceResponse>(
    `/api/services/${serviceId}/toggle`
  );
};

// ============================================
// TanStack Query Hooks - Bookings
// ============================================

/**
 * Hook to fetch all bookings (admin)
 */
export const useAllBookings = (params?: GetAllBookingsParams) => {
  return useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => getAllBookings(params),
  });
};

/**
 * Hook to update booking status (admin)
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingStatusRequest }) =>
      updateBookingStatus(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
};

// ============================================
// TanStack Query Hooks - Service Categories
// ============================================

/**
 * Hook to create service category (admin)
 */
export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
};

/**
 * Hook to update service category (admin)
 */
export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateServiceCategoryRequest }) =>
      updateServiceCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
};

/**
 * Hook to delete service category (admin)
 */
export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
};

// ============================================
// TanStack Query Hooks - Services
// ============================================

/**
 * Hook to fetch all services (admin)
 */
export const useAllServices = (params?: GetAllServicesParams) => {
  return useQuery({
    queryKey: ['admin-services', params],
    queryFn: () => getAllServices(params),
  });
};

/**
 * Hook to create service (admin)
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
};

/**
 * Hook to update service (admin)
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: UpdateServiceRequest }) =>
      updateService(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

/**
 * Hook to delete service (admin)
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
};

/**
 * Hook to toggle service status (admin)
 */
export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleServiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
