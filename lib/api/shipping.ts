// Shipping API - TanStack Query hooks for shipping settings
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// ============================================
// Type Definitions
// ============================================

export interface ShippingSettings {
  id: string;
  shippingCharge: string; // Decimal as string
  freeShippingThreshold: string; // Decimal as string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetShippingSettingsResponse {
  success: boolean;
  data: ShippingSettings;
}

// ============================================
// API Functions
// ============================================

/**
 * Get shipping settings (charge, free shipping threshold, etc.)
 */
export const getShippingSettings = async (): Promise<GetShippingSettingsResponse> => {
  return apiClient.get<GetShippingSettingsResponse>('/api/orders/shipping/settings');
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook to fetch shipping settings
 */
export const useGetShippingSettings = () => {
  return useQuery({
    queryKey: ['shipping', 'settings'],
    queryFn: getShippingSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes (settings don't change often)
    retry: 2,
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate shipping cost based on cart total and settings
 */
export const calculateShippingCost = (
  cartTotal: number,
  settings: ShippingSettings | undefined
): number => {
  if (!settings || !settings.isActive) {
    return 0;
  }

  const threshold = parseFloat(settings.freeShippingThreshold);
  const charge = parseFloat(settings.shippingCharge);

  // Free shipping if cart total meets or exceeds threshold
  if (cartTotal >= threshold) {
    return 0;
  }

  return charge;
};

/**
 * Check if order qualifies for free shipping
 */
export const qualifiesForFreeShipping = (
  cartTotal: number,
  settings: ShippingSettings | undefined
): boolean => {
  if (!settings || !settings.isActive) {
    return true; // Free if no settings
  }

  const threshold = parseFloat(settings.freeShippingThreshold);
  return cartTotal >= threshold;
};

/**
 * Calculate how much more is needed for free shipping
 */
export const amountNeededForFreeShipping = (
  cartTotal: number,
  settings: ShippingSettings | undefined
): number => {
  if (!settings || !settings.isActive) {
    return 0;
  }

  const threshold = parseFloat(settings.freeShippingThreshold);
  
  if (cartTotal >= threshold) {
    return 0;
  }

  return threshold - cartTotal;
};

/**
 * Format shipping cost for display
 */
export const formatShippingCost = (cost: number): string => {
  if (cost === 0) {
    return 'FREE';
  }
  return `£${cost.toFixed(2)}`;
};
