// Combined hook for wishlist management (API + Zustand)
import { useEffect } from 'react';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import {
  useWishlist as useWishlistQuery,
  useAddToWishlist,
  useRemoveFromWishlist,
} from '@/lib/api/wishlist';
import { useAuth } from '@clerk/nextjs';

/**
 * Combined hook for wishlist management
 * Syncs API data with Zustand store
 */
export const useWishlist = () => {
  const { isSignedIn } = useAuth();
  
  // Zustand store
  const {
    items,
    isLoading: storeLoading,
    error: storeError,
    setItems,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
    getItemCount,
    setLoading,
    setError,
  } = useWishlistStore();

  // API hooks
  const {
    data: wishlistData,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useWishlistQuery();

  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  // Sync API data to store when it changes
  useEffect(() => {
    if (wishlistData?.data) {
      setItems(wishlistData.data);
      setLoading(false);
      setError(null);
    }
  }, [wishlistData, setItems, setLoading, setError]);

  // Handle API errors
  useEffect(() => {
    if (apiError) {
      setError(apiError.message);
      setLoading(false);
    }
  }, [apiError, setError, setLoading]);

  // Clear wishlist when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      clearWishlist();
    }
  }, [isSignedIn, clearWishlist]);

  /**
   * Add bicycle to wishlist
   */
  const add = async (bicycleId: string) => {
    try {
      setLoading(true);
      await addMutation.mutateAsync(bicycleId);
      // Refetch to get updated data with bicycle details
      await refetch();
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to add to wishlist');
      return { success: false, error };
    }
  };

  /**
   * Remove bicycle from wishlist
   */
  const remove = async (bicycleId: string) => {
    try {
      setLoading(true);
      await removeMutation.mutateAsync(bicycleId);
      removeItem(bicycleId);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to remove from wishlist');
      return { success: false, error };
    }
  };

  /**
   * Toggle wishlist status
   */
  const toggle = async (bicycleId: string) => {
    const inWishlist = isInWishlist(bicycleId);
    if (inWishlist) {
      return remove(bicycleId);
    } else {
      return add(bicycleId);
    }
  };

  return {
    // Data
    items,
    count: getItemCount(),
    
    // State
    isLoading: storeLoading || apiLoading,
    error: storeError || (apiError ? apiError.message : null),
    
    // Actions
    add,
    remove,
    toggle,
    clear: clearWishlist,
    isInWishlist,
    refetch,
    
    // Mutation states
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
