// Addresses API - TanStack Query hooks for address management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { Address } from '@/lib/types/allTypes';
import { AddressType } from '@/lib/types/allTypes';

export type { Address };
export { AddressType };

// ============================================
// Type Definitions
// ============================================

export interface CreateAddressRequest {
  type: AddressType;
  title?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  type?: AddressType;
  title?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface GetAllAddressesResponse {
  success: boolean;
  data: Address[];
  count: number;
}

export interface GetDefaultAddressResponse {
  success: boolean;
  data: Address;
}

export interface GetAddressesByTypeResponse {
  success: boolean;
  data: Address[];
  count: number;
}

export interface CreateAddressResponse {
  success: boolean;
  message: string;
  data: Address;
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  data: Address;
}

export interface DeleteAddressResponse {
  success: boolean;
  message: string;
}

export interface SetDefaultAddressResponse {
  success: boolean;
  message: string;
  data: Address;
}

export interface ValidateAddressResponse {
  success: boolean;
  data: {
    valid: boolean;
    address: Address;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Get all addresses for the current user
 */
export const getAllAddresses = async (): Promise<GetAllAddressesResponse> => {
  return apiClient.get<GetAllAddressesResponse>('/api/addresses');
};

/**
 * Get the default address for the current user
 */
export const getDefaultAddress = async (): Promise<GetDefaultAddressResponse> => {
  return apiClient.get<GetDefaultAddressResponse>('/api/addresses/default');
};

/**
 * Get addresses by type (HOME, WORK, BILLING, SHIPPING)
 */
export const getAddressesByType = async (
  type: AddressType
): Promise<GetAddressesByTypeResponse> => {
  return apiClient.get<GetAddressesByTypeResponse>(`/api/addresses/type/${type}`);
};

/**
 * Create a new address
 */
export const createAddress = async (
  request: CreateAddressRequest
): Promise<CreateAddressResponse> => {
  return apiClient.post<CreateAddressResponse>('/api/addresses', request);
};

/**
 * Update an existing address
 */
export const updateAddress = async (
  addressId: string,
  request: UpdateAddressRequest
): Promise<UpdateAddressResponse> => {
  return apiClient.put<UpdateAddressResponse>(`/api/addresses/${addressId}`, request);
};

/**
 * Delete an address
 */
export const deleteAddress = async (
  addressId: string
): Promise<DeleteAddressResponse> => {
  return apiClient.delete<DeleteAddressResponse>(`/api/addresses/${addressId}`);
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (
  addressId: string
): Promise<SetDefaultAddressResponse> => {
  return apiClient.patch<SetDefaultAddressResponse>(
    `/api/addresses/${addressId}/default`
  );
};

/**
 * Validate an address
 */
export const validateAddress = async (
  addressId: string
): Promise<ValidateAddressResponse> => {
  return apiClient.post<ValidateAddressResponse>(
    `/api/addresses/${addressId}/validate`
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch all addresses
 */
export const useGetAllAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: getAllAddresses,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch the default address
 */
export const useGetDefaultAddress = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['addresses', 'default'],
    queryFn: getDefaultAddress,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch addresses by type
 */
export const useGetAddressesByType = (type: AddressType, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['addresses', 'type', type],
    queryFn: () => getAddressesByType(type),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to create a new address
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAddressRequest) => createAddress(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create address:', error);
    },
  });
};

/**
 * Hook to update an address
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, request }: { addressId: string; request: UpdateAddressRequest }) =>
      updateAddress(addressId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update address:', error);
    },
  });
};

/**
 * Hook to delete an address
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete address:', error);
    },
  });
};

/**
 * Hook to set an address as default
 */
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: Error) => {
      console.error('Failed to set default address:', error);
    },
  });
};

/**
 * Hook to validate an address
 */
export const useValidateAddress = () => {
  return useMutation({
    mutationFn: (addressId: string) => validateAddress(addressId),
    onError: (error: Error) => {
      console.error('Failed to validate address:', error);
    },
  });
};
