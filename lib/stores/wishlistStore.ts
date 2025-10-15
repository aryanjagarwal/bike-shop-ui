// Zustand store for wishlist management
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WishlistItem } from '@/lib/api/wishlist';

// ============================================
// Types
// ============================================

interface WishlistState {
  // State
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (bicycleId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (bicycleId: string) => boolean;
  getItemCount: () => number;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// ============================================
// Zustand Store
// ============================================

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,

      // Set all items (from API)
      setItems: (items) => set({ items, error: null }),

      // Add item to wishlist
      addItem: (item) =>
        set((state) => {
          // Check if item already exists
          const exists = state.items.some(
            (i) => i.bicycleId === item.bicycleId
          );
          if (exists) return state;

          return {
            items: [...state.items, item],
            error: null,
          };
        }),

      // Remove item from wishlist
      removeItem: (bicycleId) =>
        set((state) => ({
          items: state.items.filter((item) => item.bicycleId !== bicycleId),
          error: null,
        })),

      // Clear entire wishlist
      clearWishlist: () => set({ items: [], error: null }),

      // Check if bicycle is in wishlist
      isInWishlist: (bicycleId) => {
        const state = get();
        return state.items.some((item) => item.bicycleId === bicycleId);
      },

      // Get total item count
      getItemCount: () => {
        const state = get();
        return state.items.length;
      },

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error state
      setError: (error) => set({ error }),
    }),
    {
      name: 'wishlist-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not loading/error states
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ============================================
// Selectors (for better performance)
// ============================================

export const selectWishlistItems = (state: WishlistState) => state.items;
export const selectWishlistCount = (state: WishlistState) => state.items.length;
export const selectIsInWishlist = (bicycleId: string) => (state: WishlistState) =>
  state.items.some((item) => item.bicycleId === bicycleId);
export const selectWishlistLoading = (state: WishlistState) => state.isLoading;
export const selectWishlistError = (state: WishlistState) => state.error;
