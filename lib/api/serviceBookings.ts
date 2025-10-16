// Service Bookings API - TanStack Query hooks for customer service bookings
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import { BookingStatus, PaymentStatus } from '@/lib/types/allTypes';
import type { 
  Service, 
  ServiceCategory, 
  ServiceBooking,
  User
} from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

// For list view - simplified services (used by GET /api/services/categories)
export interface ServiceCategoryWithServices extends Omit<ServiceCategory, 'services'> {
  services: Array<{
    id: string;
    name: string;
    basePrice: string;
  }>;
}

// For detail view - full services (used by GET /api/services/categories/:id)
export interface ServiceCategoryWithFullServices extends Omit<ServiceCategory, 'services'> {
  services: Service[];
}

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

export interface ServiceBookingWithDetails extends Omit<ServiceBooking, 'user' | 'service' | 'images' | 'technician' | 'payments'> {
  service: ServiceWithCategory;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
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

// Booking response for "Get My Bookings" - doesn't include user field since it's the current user
export interface MyServiceBooking extends Omit<ServiceBookingWithDetails, 'user'> {}

export interface GetAllServicesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}

export interface GetAllServicesResponse {
  success: boolean;
  data: ServiceWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetMyBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export interface GetMyBookingsResponse {
  success: boolean;
  data: MyServiceBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateBookingRequest {
  serviceId: string;
  bookingDate: string; // ISO date string
  bookingTime: string; // ISO date string
  customerNotes?: string;
  customerBikeDetails?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: ServiceBookingWithDetails;
}

export interface UpdateBookingRequest {
  bookingDate?: string;
  bookingTime?: string;
  customerNotes?: string;
  customerBikeDetails?: string;
}

export interface UpdateBookingResponse {
  success: boolean;
  message: string;
  data: ServiceBookingWithDetails;
}

export interface CancelBookingRequest {
  reason: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: ServiceBookingWithDetails;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all service categories (public)
 */
export const getAllServiceCategories = async (): Promise<ApiResponse<ServiceCategoryWithServices[]>> => {
  return apiClient.get<ApiResponse<ServiceCategoryWithServices[]>>('/api/services/categories');
};

/**
 * Get service category by ID (public)
 */
export const getServiceCategoryById = async (
  categoryId: string
): Promise<ApiResponse<ServiceCategoryWithFullServices>> => {
  return apiClient.get<ApiResponse<ServiceCategoryWithFullServices>>(
    `/api/services/categories/${categoryId}`
  );
};

/**
 * Get all services with filters (requires auth)
 */
export const getAllServices = async (
  params?: GetAllServicesParams
): Promise<GetAllServicesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/service-bookings/services${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get<GetAllServicesResponse>(endpoint);
};

/**
 * Get service by ID (requires auth)
 */
export const getServiceById = async (
  serviceId: string
): Promise<ApiResponse<ServiceWithCategory>> => {
  return apiClient.get<ApiResponse<ServiceWithCategory>>(
    `/api/service-bookings/services/${serviceId}`
  );
};

/**
 * Create a service booking (requires auth)
 */
export const createServiceBooking = async (
  data: CreateBookingRequest
): Promise<CreateBookingResponse> => {
  return apiClient.post<CreateBookingResponse>('/api/service-bookings', data);
};

/**
 * Get my bookings (requires auth)
 */
export const getMyBookings = async (
  params?: GetMyBookingsParams
): Promise<GetMyBookingsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/api/service-bookings/me${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get<GetMyBookingsResponse>(endpoint);
};

/**
 * Get booking by ID (requires auth)
 */
export const getBookingById = async (
  bookingId: string
): Promise<ApiResponse<ServiceBookingWithDetails>> => {
  return apiClient.get<ApiResponse<ServiceBookingWithDetails>>(
    `/api/service-bookings/${bookingId}`
  );
};

/**
 * Update booking (requires auth)
 */
export const updateBooking = async (
  bookingId: string,
  data: UpdateBookingRequest
): Promise<UpdateBookingResponse> => {
  return apiClient.patch<UpdateBookingResponse>(
    `/api/service-bookings/${bookingId}`,
    data
  );
};

/**
 * Cancel booking (requires auth)
 */
export const cancelBooking = async (
  bookingId: string,
  data: CancelBookingRequest
): Promise<CancelBookingResponse> => {
  return apiClient.post<CancelBookingResponse>(
    `/api/service-bookings/${bookingId}/cancel`,
    data
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch all service categories (public)
 */
export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: getAllServiceCategories,
  });
};

/**
 * Hook to fetch service category by ID (public)
 */
export const useServiceCategory = (categoryId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['service-categories', categoryId],
    queryFn: () => getServiceCategoryById(categoryId),
    enabled: enabled && !!categoryId,
  });
};

/**
 * Hook to fetch all services with filters (requires auth)
 */
export const useServices = (params?: GetAllServicesParams) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => getAllServices(params),
  });
};

/**
 * Hook to fetch service by ID (requires auth)
 */
export const useService = (serviceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['services', serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: enabled && !!serviceId,
  });
};

/**
 * Hook to fetch my bookings (requires auth)
 */
export const useMyBookings = (params?: GetMyBookingsParams) => {
  return useQuery({
    queryKey: ['my-bookings', params],
    queryFn: () => getMyBookings(params),
  });
};

/**
 * Hook to fetch booking by ID (requires auth)
 */
export const useBooking = (bookingId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: enabled && !!bookingId,
  });
};

/**
 * Hook to create a service booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceBooking,
    onSuccess: () => {
      // Invalidate bookings queries
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

/**
 * Hook to update a booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingRequest }) =>
      updateBooking(bookingId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific booking and list queries
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: CancelBookingRequest }) =>
      cancelBooking(bookingId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific booking and list queries
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format booking status for display
 */
export const formatBookingStatus = (status: BookingStatus): string => {
  const statusMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'Pending',
    [BookingStatus.CONFIRMED]: 'Confirmed',
    [BookingStatus.IN_PROGRESS]: 'In Progress',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.CANCELLED]: 'Cancelled',
  };
  return statusMap[status] || status;
};

/**
 * Get color class for booking status
 */
export const getBookingStatusColor = (status: BookingStatus): string => {
  const colorMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
    [BookingStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800',
    [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (status: PaymentStatus): string => {
  const statusMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Pending',
    [PaymentStatus.SUCCEEDED]: 'Paid',
    [PaymentStatus.FAILED]: 'Failed',
    [PaymentStatus.CANCELLED]: 'Cancelled',
    [PaymentStatus.REFUNDED]: 'Refunded',
  };
  return statusMap[status] || status;
};

/**
 * Get color class for payment status
 */
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colorMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.SUCCEEDED]: 'bg-green-100 text-green-800',
    [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
    [PaymentStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    [PaymentStatus.REFUNDED]: 'bg-orange-100 text-orange-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
