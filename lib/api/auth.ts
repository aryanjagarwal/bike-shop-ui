// auth.ts --> for authentication and token management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from './client';
import { tokenStorage } from './tokenStorage';
import type { User } from '@/lib/types/allTypes';

export type { User };

export interface AuthTokenResponse {
  token: string;
  user: User;
}

export interface ExchangeTokenRequest {
  clerkUserId: string;
}

export interface RefreshTokenRequest {
  clerkUserId: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Exchange Clerk user ID for JWT token
 */
export const exchangeToken = async (
  clerkUserId: string
): Promise<ApiResponse<AuthTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
    '/api/auth/exchange',
    { clerkUserId }
  );
  
  // Store token and user data
  if (response.success && response.data) {
    tokenStorage.setToken(response.data.token);
    tokenStorage.setUser(response.data.user);
  }
  
  return response;
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (
  clerkUserId: string
): Promise<ApiResponse<AuthTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
    '/api/auth/refresh',
    { clerkUserId }
  );
  
  // Update stored token and user data
  if (response.success && response.data) {
    tokenStorage.setToken(response.data.token);
    tokenStorage.setUser(response.data.user);
  }
  
  return response;
};

/**
 * Get current user from database (not from Clerk)
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return apiClient.get<ApiResponse<User>>('/api/auth/me');
};

/**
 * Logout user and revoke token
 */
export const logoutUser = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/api/auth/logout');
  
  // Clear stored auth data
  tokenStorage.clearAll();
  
  return response;
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to exchange Clerk user ID for JWT token
 */
export const useExchangeToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clerkUserId: string) => exchangeToken(clerkUserId),
    onSuccess: (data) => {
      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error) => {
      console.error('Token exchange failed:', error);
      tokenStorage.clearAll();
    },
  });
};

/**
 * Hook to refresh JWT token
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clerkUserId: string) => refreshToken(clerkUserId),
    onSuccess: (data) => {
      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error) => {
      console.error('Token refresh failed:', error);
      tokenStorage.clearAll();
    },
  });
};

/**
 * Hook to get current user from database
 * @param enabled - Whether to enable the query (default: true if token exists)
 */
export const useCurrentUser = (enabled?: boolean) => {
  const hasToken = typeof window !== 'undefined' && !!tokenStorage.getToken();
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: enabled !== undefined ? enabled : hasToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to logout user
 * Call this along with Clerk's signOut
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      tokenStorage.clearAll();
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      // Still clear local data even if API call fails
      tokenStorage.clearAll();
      queryClient.clear();
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  return !!tokenStorage.getToken();
};

/**
 * Get stored user data without API call
 */
export const getStoredUser = (): User | null => {
  return tokenStorage.getUser();
};

/**
 * Get stored token
 */
export const getStoredToken = (): string | null => {
  return tokenStorage.getToken();
};