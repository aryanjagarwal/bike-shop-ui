// Combined hook for cart management (API + Zustand)
import { useEffect } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import {
  useCart as useCartQuery,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  type AddToCartRequest,
} from '@/lib/api/cart';
import { useAuth } from '@clerk/nextjs';

/**
 * Combined hook for cart management
 * Syncs API data with Zustand store
 */
export const useCart = () => {
  const { isSignedIn } = useAuth();
  
  // Zustand store
  const {
    cart,
    isLoading: storeLoading,
    error: storeError,
    setCart,
    addItem: addItemToStore,
    updateItem: updateItemInStore,
    removeItem: removeItemFromStore,
    clearCart: clearCartInStore,
    getItemCount,
    getItemById,
    isItemInCart,
    setLoading,
    setError,
  } = useCartStore();

  // API hooks
  const {
    data: cartData,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useCartQuery();

  const addMutation = useAddToCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();

  // Sync API data to store when it changes
  useEffect(() => {
    if (cartData?.data) {
      setCart(cartData.data);
      setLoading(false);
      setError(null);
    }
  }, [cartData, setCart, setLoading, setError]);

  // Handle API errors
  useEffect(() => {
    if (apiError) {
      setError(apiError.message);
      setLoading(false);
    }
  }, [apiError, setError, setLoading]);

  // Clear cart when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      clearCartInStore();
    }
  }, [isSignedIn, clearCartInStore]);

  /**
   * Add item to cart
   */
  const add = async (data: AddToCartRequest) => {
    try {
      // Call backend to add item (no optimistic update as we need full item details)
      const result = await addMutation.mutateAsync(data);
      if (result.data) {
        setCart(result.data);
      }
      return { success: true, data: result.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to cart');
      return { success: false, error };
    }
  };

  /**
   * Update cart item quantity - Optimistic update pattern
   */
  const updateQuantity = async (itemId: string, quantity: number) => {
    // Save current state before optimistic update
    const previousCart = cart;
    
    // Step 1: Optimistically update UI immediately
    updateItemInStore(itemId, quantity);
    
    try {
      // Step 2: Update backend
      const result = await updateMutation.mutateAsync({ itemId, quantity });
      
      // Step 3: Sync with backend response
      // Use the previous cart state as baseline for merging to preserve references better
      if (result.data && previousCart) {
        // Manually merge: preserve items that haven't changed from previousCart
        const mergedItems = result.data.items.map((newItem) => {
          const prevItem = previousCart.items?.find(item => item.id === newItem.id);
          // If item exists in previous state with same quantity, keep that reference
          if (prevItem && prevItem.quantity === newItem.quantity) {
            return prevItem;
          }
          return newItem;
        });
        
        setCart({
          ...result.data,
          items: mergedItems,
        });
      } else if (result.data) {
        setCart(result.data);
      }
      return { success: true, data: result.data };
    } catch (error) {
      // Step 4: Revert optimistic update on error by refetching from backend
      setError(error instanceof Error ? error.message : 'Failed to update cart');
      await refetch();
      return { success: false, error };
    }
  };

  /**
   * Remove item from cart - Optimistic update pattern
   */
  const remove = async (itemId: string) => {
    // Save current state before optimistic update
    const previousCart = cart;
    
    // Step 1: Optimistically remove from UI immediately
    removeItemFromStore(itemId);
    
    try {
      // Step 2: Remove from backend
      const result = await removeMutation.mutateAsync(itemId);
      
      // Step 3: Sync with backend response
      // Use the previous cart state as baseline for merging to preserve references better
      if (result.data && previousCart) {
        // Manually merge: preserve items that haven't changed from previousCart
        const mergedItems = result.data.items.map((newItem) => {
          const prevItem = previousCart.items?.find(item => item.id === newItem.id);
          // If item exists in previous state with same quantity, keep that reference
          if (prevItem && prevItem.quantity === newItem.quantity) {
            return prevItem;
          }
          return newItem;
        });
        
        setCart({
          ...result.data,
          items: mergedItems,
        });
      } else if (result.data) {
        setCart(result.data);
      }
      return { success: true, data: result.data };
    } catch (error) {
      // Step 4: Revert optimistic update on error by refetching from backend
      setError(error instanceof Error ? error.message : 'Failed to remove from cart');
      await refetch();
      return { success: false, error };
    }
  };

  /**
   * Clear entire cart - Optimistic update pattern
   */
  const clear = async () => {
    // Step 1: Optimistically clear UI immediately
    clearCartInStore();
    
    try {
      // Step 2: Clear backend cart
      await clearMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      // Step 3: Revert optimistic update on error by refetching from backend
      setError(error instanceof Error ? error.message : 'Failed to clear cart');
      await refetch();
      return { success: false, error };
    }
  };

  /**
   * Add bicycle to cart
   */
  const addBicycle = async (bicycleId: string, quantity: number = 1) => {
    return add({ bicycleId, quantity });
  };

  /**
   * Add part to cart
   */
  const addPart = async (partId: string, quantity: number = 1) => {
    return add({ partId, quantity });
  };

  return {
    // Data
    cart,
    items: cart?.items || [],
    summary: cart?.summary,
    count: getItemCount(),
    
    // State
    isLoading: storeLoading || apiLoading,
    error: storeError || (apiError ? apiError.message : null),
    
    // Actions
    add,
    addBicycle,
    addPart,
    updateQuantity,
    remove,
    clear,
    refetch,
    
    // Helpers
    getItemById,
    isItemInCart,
    
    // Mutation states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isClearing: clearMutation.isPending,
  };
};
