import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartItem, User, WishlistItem } from "./types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

interface WishlistStore {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) =>
        set((state) => {
          if (state.items.some((item) => item.productId === productId)) {
            return state;
          }
          return {
            items: [
              ...state.items,
              { productId, addedAt: new Date().toISOString() },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((item) => item.productId === productId);
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Dummy authentication
        if (email === "admin@bicycleshop.com" && password === "admin123") {
          set({
            user: {
              id: "admin-1",
              email: "admin@bicycleshop.com",
              name: "Admin User",
              role: "admin",
            },
            isAuthenticated: true,
          });
          return true;
        } else if (email === "user@example.com" && password === "user123") {
          set({
            user: {
              id: "user-1",
              email: "user@example.com",
              name: "John Doe",
              role: "customer",
            },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      register: async (email, password, name) => {
        // Dummy registration
        set({
          user: {
            id: `user-${Date.now()}`,
            email,
            name,
            role: "customer",
          },
          isAuthenticated: true,
        });
        return true;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

interface UIStore {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeAll: () =>
    set({ isMobileMenuOpen: false, isCartOpen: false, isSearchOpen: false }),
}));
