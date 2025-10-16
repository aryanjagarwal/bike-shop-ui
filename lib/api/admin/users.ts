// Admin Users API - TanStack Query hooks for admin user management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { UserRole, type User, type Profile } from '@/lib/types/allTypes';

// ============================================
// Type Definitions
// ============================================

// User with additional details for admin view
export interface UserWithDetails extends Omit<User, 'profile'> {
  profile: Profile | null;
  _count: {
    orders: number;
    serviceBookings: number;
    reviews: number;
  };
}

// Get All Users Request (Admin)
export interface GetAllUsersRequest {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string; // Search by name or email
  isActive?: boolean;
  sortBy?: 'createdAt' | 'firstName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// Get All Users Response (Admin)
export interface GetAllUsersResponse {
  success: boolean;
  data: UserWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Change User Role Request
export interface ChangeUserRoleRequest {
  role: UserRole;
}

// Change User Role Response
export interface ChangeUserRoleResponse {
  success: boolean;
  message: string;
  data: User;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (
  params?: GetAllUsersRequest
): Promise<GetAllUsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.role) queryParams.append('role', params.role);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';
  
  return apiClient.get<GetAllUsersResponse>(endpoint);
};

/**
 * Change user role (Admin only)
 */
export const changeUserRole = async (
  userId: string,
  request: ChangeUserRoleRequest
): Promise<ChangeUserRoleResponse> => {
  return apiClient.patch<ChangeUserRoleResponse>(
    `/api/users/${userId}/role`,
    request
  );
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to get all users (Admin)
 * @param params - Filter parameters for users
 * @param options - React Query options
 */
export const useAdminUsers = (
  params?: GetAllUsersRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getAllUsers(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 2, // 2 minutes default
  });
};

/**
 * Hook to change user role (Admin)
 */
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userId, 
      request 
    }: { 
      userId: string; 
      request: ChangeUserRoleRequest 
    }) => changeUserRole(userId, request),
    onSuccess: (data, variables) => {
      // Invalidate the admin users list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      
      // Invalidate the current user query if they changed their own role
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      console.error('Failed to change user role:', error);
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format user name for display
 */
export const formatUserName = (user: User | UserWithDetails): string => {
  return `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User | UserWithDetails): string => {
  const firstInitial = user.firstName?.[0] || '';
  const lastInitial = user.lastName?.[0] || '';
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
};

/**
 * Format user role for display
 */
export const formatUserRole = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: 'Customer',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.TECHNICIAN]: 'Technician',
  };
  return roleMap[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: UserRole): string => {
  const colorMap: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: 'bg-blue-100 text-blue-800',
    [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
    [UserRole.TECHNICIAN]: 'bg-green-100 text-green-800',
  };
  return colorMap[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get available roles for role change
 */
export const getAvailableRoles = (): UserRole[] => {
  return [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.TECHNICIAN];
};

/**
 * Check if role change is allowed
 */
export const canChangeRole = (
  currentRole: UserRole,
  newRole: UserRole,
  isCurrentUser: boolean
): boolean => {
  // Prevent users from changing their own role to avoid lockout
  if (isCurrentUser && currentRole === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
    return false;
  }
  return true;
};
