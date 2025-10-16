// User Profile API - TanStack Query hooks for user profile management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import type { User, Profile, Address, UserRole } from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

// User Profile with Extended Data
export interface UserProfileData extends User {
  profile: Profile & {
    preferences: UserPreferences;
  };
  addresses: Address[];
  _count: {
    orders: number;
    serviceBookings: number;
    reviews: number;
    wishlists: number;
  };
  stats: {
    totalOrders: number;
    totalBookings: number;
    totalReviews: number;
    wishlistItems: number;
  };
}

// User Preferences (parsed from JSON)
export interface UserPreferences {
  notifications?: boolean;
  newsletter?: boolean;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  [key: string]: any; // Allow additional preferences
}

// Get Current User Response
export interface GetCurrentUserResponse {
  success: boolean;
  data: UserProfileData;
}

// Update User Request
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date string
  preferences?: UserPreferences;
}

// Update User Response
export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    profile: Profile;
  };
}

// Deactivate Account Response
export interface DeactivateAccountResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    isActive: boolean;
  };
}

// Delete Account Response
export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get current user profile with all related data
 */
export const getCurrentUserProfile = async (): Promise<GetCurrentUserResponse> => {
  return apiClient.get<GetCurrentUserResponse>('/api/users/me');
};

/**
 * Update current user profile
 */
export const updateUserProfile = async (
  request: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  return apiClient.put<UpdateUserResponse>('/api/users/me', request);
};

/**
 * Deactivate current user account
 */
export const deactivateAccount = async (): Promise<DeactivateAccountResponse> => {
  return apiClient.post<DeactivateAccountResponse>('/api/users/me/deactivate');
};

/**
 * Delete current user account (permanent)
 */
export const deleteAccount = async (): Promise<DeleteAccountResponse> => {
  return apiClient.delete<DeleteAccountResponse>('/api/users/me');
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to get current user profile
 * @param options - React Query options
 */
export const useUserProfile = (
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getCurrentUserProfile,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateUserRequest) => updateUserProfile(request),
    onSuccess: (data) => {
      // Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      
      // Invalidate current user query from auth
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      console.error('Failed to update user profile:', error);
    },
  });
};

/**
 * Hook to deactivate account
 */
export const useDeactivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateAccount,
    onSuccess: () => {
      // Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      
      // Invalidate current user query from auth
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      console.error('Failed to deactivate account:', error);
    },
  });
};

/**
 * Hook to delete account (permanent)
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error('Failed to delete account:', error);
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Parse preferences from JSON string
 */
export const parsePreferences = (preferences: string | null): UserPreferences => {
  if (!preferences) return {};
  
  try {
    return JSON.parse(preferences);
  } catch (error) {
    console.error('Failed to parse preferences:', error);
    return {};
  }
};

/**
 * Format user's full name
 */
export const formatUserName = (user: User | UserProfileData): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

/**
 * Format user role for display
 */
export const formatUserRole = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'CUSTOMER':
      return 'Customer';
    case 'TECHNICIAN':
      return 'Technician';
    default:
      return role;
  }
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User | UserProfileData): string => {
  const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

/**
 * Check if user has completed their profile
 */
export const isProfileComplete = (user: UserProfileData): boolean => {
  return !!(
    user.firstName &&
    user.lastName &&
    user.email &&
    user.phone &&
    user.profile?.dateOfBirth &&
    user.addresses.length > 0
  );
};

/**
 * Get profile completion percentage
 */
export const getProfileCompletionPercentage = (user: UserProfileData): number => {
  let completed = 0;
  const total = 6;

  if (user.firstName) completed++;
  if (user.lastName) completed++;
  if (user.email) completed++;
  if (user.phone) completed++;
  if (user.profile?.dateOfBirth) completed++;
  if (user.addresses.length > 0) completed++;

  return Math.round((completed / total) * 100);
};

/**
 * Format date of birth for display
 */
export const formatDateOfBirth = (dateOfBirth: string | null): string => {
  if (!dateOfBirth) return 'Not set';
  
  try {
    const date = new Date(dateOfBirth);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Calculate user age from date of birth
 */
export const calculateAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) return null;
  
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
};

/**
 * Get default address from user's addresses
 */
export const getDefaultAddress = (addresses: Address[]): Address | null => {
  return addresses.find(addr => addr.isDefault) || addresses[0] || null;
};

/**
 * Format address for display
 */
export const formatAddress = (address: Address): string => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.county,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Get user activity summary
 */
export const getUserActivitySummary = (user: UserProfileData): string => {
  const { stats } = user;
  const activities = [];
  
  if (stats.totalOrders > 0) {
    activities.push(`${stats.totalOrders} order${stats.totalOrders > 1 ? 's' : ''}`);
  }
  
  if (stats.totalBookings > 0) {
    activities.push(`${stats.totalBookings} booking${stats.totalBookings > 1 ? 's' : ''}`);
  }
  
  if (stats.totalReviews > 0) {
    activities.push(`${stats.totalReviews} review${stats.totalReviews > 1 ? 's' : ''}`);
  }
  
  if (stats.wishlistItems > 0) {
    activities.push(`${stats.wishlistItems} wishlist item${stats.wishlistItems > 1 ? 's' : ''}`);
  }
  
  return activities.length > 0 ? activities.join(' • ') : 'No activity yet';
};
