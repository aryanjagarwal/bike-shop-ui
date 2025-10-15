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
      setLoading(true);
      const result = await addMutation.mutateAsync(data);
      if (result.data) {
        setCart(result.data);
      }
      setLoading(false);
      return { success: true, data: result.data };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to add to cart');
      return { success: false, error };
    }
  };

  /**
   * Update cart item quantity
   */
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      // Optimistic update
      updateItemInStore(itemId, quantity);
      
      const result = await updateMutation.mutateAsync({ itemId, quantity });
      if (result.data) {
        setCart(result.data);
      }
      setLoading(false);
      return { success: true, data: result.data };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to update cart');
      // Refetch to revert optimistic update
      await refetch();
      return { success: false, error };
    }
  };

  /**
   * Remove item from cart
   */
  const remove = async (itemId: string) => {
    try {
      setLoading(true);
      // Optimistic update
      removeItemFromStore(itemId);
      
      const result = await removeMutation.mutateAsync(itemId);
      if (result.data) {
        setCart(result.data);
      }
      setLoading(false);
      return { success: true, data: result.data };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to remove from cart');
      // Refetch to revert optimistic update
      await refetch();
      return { success: false, error };
    }
  };

  /**
   * Clear entire cart
   */
  const clear = async () => {
    try {
      setLoading(true);
      await clearMutation.mutateAsync();
      clearCartInStore();
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to clear cart');
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
