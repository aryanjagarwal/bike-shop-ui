"use client";

import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { items, count, isLoading, remove, isRemoving } = useWishlist();

  // Redirect to login if not signed in
  if (!isSignedIn) {
    router.push('/auth/login');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (count === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">
              Save your favorite bicycles for later!
            </p>
            <Link href="/shop/bicycles">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-600">{count} {count === 1 ? 'item' : 'items'} saved</p>
          </div>
          <Link href="/shop/bicycles">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const bicycle = item.bicycle;
            if (!bicycle) return null;

            const primaryImage = bicycle.images?.find((img) => img.isPrimary) || bicycle.images?.[0];
            const imageUrl = primaryImage?.cloudinaryUrl || '/placeholder-bike.jpg';
            const price = parseFloat(bicycle.price);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-64 overflow-hidden bg-gray-50">
                  <Link href={`/shop/bicycles/${bicycle.id}`}>
                    <Image
                      src={imageUrl}
                      alt={bicycle.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  
                  {/* Remove Button - Floating on Image */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => remove(bicycle.id)}
                    disabled={isRemoving}
                    className="absolute top-4 right-4 p-2 rounded-full bg-red-50 backdrop-blur-sm hover:bg-red-100 shadow-lg hover:shadow-xl transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </motion.button>
                  
                  {/* Featured Badge */}
                  {bicycle.isFeatured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      Featured
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  {bicycle.stockQuantity === 0 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      Out of Stock
                    </div>
                  )}
                  {bicycle.stockQuantity > 0 && bicycle.stockQuantity <= 5 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      Only {bicycle.stockQuantity} left
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Brand & Category */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {bicycle.brand}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      {bicycle.category}
                    </span>
                  </div>

                  {/* Name */}
                  <Link href={`/shop/bicycles/${bicycle.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {bicycle.name}
                    </h3>
                  </Link>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {bicycle.frameSize}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {bicycle.frameMaterial}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {bicycle.year}
                    </span>
                  </div>

                  {/* Add to Cart & Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={bicycle.stockQuantity === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add to cart logic here
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </motion.button>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        £{price.toLocaleString()}
                      </p>
                      {bicycle.warrantyPeriod && (
                        <p className="text-xs text-gray-500">
                          {bicycle.warrantyPeriod} warranty
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
