// Search API - TanStack Query hooks for product search
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// ============================================
// Type Definitions
// ============================================

export interface SearchParams {
  q: string; // Search query (required, max 200 chars)
  page?: number; // Page number (default: 1, min: 1)
  limit?: number; // Results per page (default: 20, max: 100)
  minPrice?: number; // Minimum price filter
  maxPrice?: number; // Maximum price filter
  category?: string; // Filter by category
  brand?: string; // Filter by brand
  inStockOnly?: boolean; // Show only in-stock items (default: false)
  sortBy?: 'relevance' | 'price' | 'name' | 'createdAt'; // Sort field (default: relevance)
  sortOrder?: 'asc' | 'desc'; // Sort order (default: desc)
}

export interface SearchResultItem {
  id: string;
  type: 'bicycle' | 'part';
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  slug?: string; // Only for parts
  relevanceScore: number;
}

export interface BrandFacet {
  name: string;
  count: number;
}

export interface CategoryFacet {
  name: string;
  count: number;
}

export interface PriceRangeFacet {
  range: string;
  count: number;
}

export interface SearchFacets {
  brands: BrandFacet[];
  categories: CategoryFacet[];
  priceRanges: PriceRangeFacet[];
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResultItem[];
  pagination: SearchPagination;
  facets: SearchFacets;
  searchTime: number; // Search execution time in milliseconds
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build query string from search parameters
 */
const buildSearchQueryString = (params: SearchParams): string => {
  const queryParams = new URLSearchParams();

  // Required parameter
  queryParams.append('q', params.q);

  // Optional parameters
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.inStockOnly !== undefined) queryParams.append('inStockOnly', params.inStockOnly.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  return queryParams.toString();
};

// ============================================
// API Functions
// ============================================

/**
 * Unified search (Bicycles + Parts)
 */
export const searchAll = async (params: SearchParams): Promise<SearchResponse> => {
  const queryString = buildSearchQueryString(params);
  return apiClient.get<SearchResponse>(`/api/search?${queryString}`);
};

/**
 * Search bicycles only
 */
export const searchBicycles = async (params: SearchParams): Promise<SearchResponse> => {
  const queryString = buildSearchQueryString(params);
  return apiClient.get<SearchResponse>(`/api/search/bicycles?${queryString}`);
};

/**
 * Search parts only
 */
export const searchParts = async (params: SearchParams): Promise<SearchResponse> => {
  const queryString = buildSearchQueryString(params);
  return apiClient.get<SearchResponse>(`/api/search/parts?${queryString}`);
};

// ============================================
// TanStack Query Hooks
// ============================================

/**
 * Hook for unified search (Bicycles + Parts)
 * @param params - Search parameters
 * @param enabled - Whether the query should run (default: true if query is not empty)
 */
export const useSearchAll = (params: SearchParams, enabled?: boolean) => {
  const shouldEnable = enabled !== undefined ? enabled : params.q.trim().length > 0;

  return useQuery({
    queryKey: ['search', 'all', params],
    queryFn: () => searchAll(params),
    enabled: shouldEnable,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for bicycle-only search
 * @param params - Search parameters
 * @param enabled - Whether the query should run (default: true if query is not empty)
 */
export const useSearchBicycles = (params: SearchParams, enabled?: boolean) => {
  const shouldEnable = enabled !== undefined ? enabled : params.q.trim().length > 0;

  return useQuery({
    queryKey: ['search', 'bicycles', params],
    queryFn: () => searchBicycles(params),
    enabled: shouldEnable,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for parts-only search
 * @param params - Search parameters
 * @param enabled - Whether the query should run (default: true if query is not empty)
 */
export const useSearchParts = (params: SearchParams, enabled?: boolean) => {
  const shouldEnable = enabled !== undefined ? enabled : params.q.trim().length > 0;

  return useQuery({
    queryKey: ['search', 'parts', params],
    queryFn: () => searchParts(params),
    enabled: shouldEnable,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================
// Utility Functions
// ============================================

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get product URL based on type
 */
export const getProductUrl = (item: SearchResultItem): string => {
  if (item.type === 'bicycle') {
    return `/shop/bicycles/${item.id}`;
  } else {
    return `/shop/parts/${item.id}`;
  }
};

/**
 * Check if item is in stock
 */
export const isInStock = (item: SearchResultItem): boolean => {
  return item.stockQuantity > 0;
};

/**
 * Get stock status text
 */
export const getStockStatus = (item: SearchResultItem): string => {
  if (item.stockQuantity === 0) return 'Out of Stock';
  if (item.stockQuantity <= 5) return `Only ${item.stockQuantity} left`;
  return 'In Stock';
};

/**
 * Get stock status color class
 */
export const getStockStatusColor = (item: SearchResultItem): string => {
  if (item.stockQuantity === 0) return 'text-red-600';
  if (item.stockQuantity <= 5) return 'text-orange-600';
  return 'text-green-600';
};

/**
 * Format search time for display
 */
export const formatSearchTime = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)}s`;
};

/**
 * Get price range label
 */
export const getPriceRangeLabel = (minPrice?: number, maxPrice?: number): string => {
  if (minPrice !== undefined && maxPrice !== undefined) {
    return `£${minPrice} - £${maxPrice}`;
  } else if (minPrice !== undefined) {
    return `Over £${minPrice}`;
  } else if (maxPrice !== undefined) {
    return `Under £${maxPrice}`;
  }
  return 'All Prices';
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): { valid: boolean; error?: string } => {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Search query cannot be empty' };
  }
  if (query.length > 200) {
    return { valid: false, error: 'Search query cannot exceed 200 characters' };
  }
  return { valid: true };
};

/**
 * Get default search params
 */
export const getDefaultSearchParams = (query: string): SearchParams => {
  return {
    q: query,
    page: 1,
    limit: 20,
    sortBy: 'relevance',
    sortOrder: 'desc',
    inStockOnly: false,
  };
};
