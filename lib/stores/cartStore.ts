// Zustand store for cart management
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartWithDetails, CartItemWithDetails, CartSummary } from '@/lib/api/cart';

// ============================================
// Types
// ============================================

interface CartState {
  // State
  cart: CartWithDetails | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCart: (cart: CartWithDetails) => void;
  addItem: (item: CartItemWithDetails) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemById: (itemId: string) => CartItemWithDetails | undefined;
  isItemInCart: (bicycleId?: string, partId?: string) => boolean;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// ============================================
// Zustand Store
// ============================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,

      // Set entire cart (from API)
      setCart: (cart) => set({ cart, error: null }),

      // Add item to cart (optimistic update)
      addItem: (item) =>
        set((state) => {
          if (!state.cart || !state.cart.items) return state;

          // Check if item already exists
          const existingItemIndex = state.cart.items?.findIndex(
            (i) => i.bicycleId === item.bicycleId && i.partId === item.partId
          );

          let updatedItems;
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            updatedItems = [...state.cart.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + item.quantity,
            };
          } else {
            // Add new item
            updatedItems = [...(state.cart.items || []), item];
          }

          return {
            cart: {
              ...state.cart,
              items: updatedItems,
            },
            error: null,
          };
        }),

      // Update item quantity
      updateItem: (itemId, quantity) =>
        set((state) => {
          if (!state.cart || !state.cart.items) return state;

          const updatedItems = state.cart.items?.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );

          return {
            cart: {
              ...state.cart,
              items: updatedItems,
            },
            error: null,
          };
        }),

      // Remove item from cart
      removeItem: (itemId) =>
        set((state) => {
          if (!state.cart || !state.cart.items) return state;

          const updatedItems = state.cart.items.filter((item) => item.id !== itemId);

          return {
            cart: {
              ...state.cart,
              items: updatedItems,
            },
            error: null,
          };
        }),

      // Clear entire cart
      clearCart: () =>
        set({
          cart: null,
          error: null,
        }),

      // Get total item count
      getItemCount: () => {
        const state = get();
        if (!state.cart || !state.cart.items) return 0;
        return state.cart.items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get item by ID
      getItemById: (itemId) => {
        const state = get();
        if (!state.cart || !state.cart.items) return undefined;
        return state.cart.items.find((item) => item.id === itemId);
      },

      // Check if item is in cart
      isItemInCart: (bicycleId, partId) => {
        const state = get();
        if (!state.cart || !state.cart.items) return false;
        return state.cart.items.some(
          (item) =>
            (bicycleId && item.bicycleId === bicycleId) ||
            (partId && item.partId === partId)
        );
      },

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error state
      setError: (error) => set({ error }),
    }),
    {
      name: 'cart-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist cart data, not loading/error states
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// ============================================
// Selectors (for better performance)
// ============================================

export const selectCart = (state: CartState) => state.cart;
export const selectCartItems = (state: CartState) => state.cart?.items || [];
export const selectCartSummary = (state: CartState) => state.cart?.summary;
export const selectCartCount = (state: CartState) => {
  if (!state.cart || !state.cart.items) return 0;
  return state.cart.items.reduce((total, item) => total + item.quantity, 0);
};
export const selectCartLoading = (state: CartState) => state.isLoading;
export const selectCartError = (state: CartState) => state.error;
export const selectIsItemInCart = (bicycleId?: string, partId?: string) => (state: CartState) => {
  if (!state.cart || !state.cart.items) return false;
  return state.cart.items.some(
    (item) =>
      (bicycleId && item.bicycleId === bicycleId) ||
      (partId && item.partId === partId)
  );
};
