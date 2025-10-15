"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Bicycle, BicycleImage } from "@/lib/types/allTypes";

interface BicycleCardProps {
  bicycle: Bicycle;
}

export default function BicycleCard({ bicycle }: BicycleCardProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { toggle, isInWishlist, isAdding: isAddingToWishlist, isRemoving } = useWishlist();
  const { addBicycle, isAdding: isAddingToCart, items, updateQuantity, isUpdating, isItemInCart } = useCart();
  
  const primaryImage = bicycle.images?.find((img: BicycleImage) => img.isPrimary) || bicycle.images?.[0];
  const imageUrl = primaryImage?.cloudinaryUrl || '/placeholder-bike.jpg';
  const price = parseFloat(bicycle.price);
  
  const inWishlist = isInWishlist(bicycle.id);
  const isWishlistLoading = isAddingToWishlist || isRemoving;
  
  // Check if item is in cart and get its details
  const isInCart = isItemInCart(bicycle.id);
  const cartItem = items.find(item => item.bicycleId === bicycle.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    
    await toggle(bicycle.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    
    await addBicycle(bicycle.id, 1);
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cartItem) return;
    await updateQuantity(cartItem.id, currentQuantity + 1);
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!cartItem) return;
    if (currentQuantity > 1) {
      await updateQuantity(cartItem.id, currentQuantity - 1);
    }
  };

  return (
    <motion.div
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
        
        {/* Wishlist Heart - Floating on Image */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isWishlistLoading}
          className={`absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
            inWishlist ? 'bg-red-50' : ''
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistClick}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              inWishlist 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-700 hover:text-red-500'
            }`}
          />
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

        {/* Description 
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {bicycle.description}
        </p>
        */}

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
          {/* Add to Cart Button or Quantity Control */}
          {!isInCart ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={bicycle.stockQuantity === 0 || isAddingToCart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-1 border border-blue-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isUpdating || currentQuantity <= 1}
                className="p-2 rounded-md bg-white hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDecrement}
              >
                <Minus className="w-4 h-4 text-blue-600" />
              </motion.button>
              
              <span className="min-w-[2rem] text-center font-semibold text-blue-900">
                {currentQuantity}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isUpdating || currentQuantity >= bicycle.stockQuantity}
                className="p-2 rounded-md bg-white hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleIncrement}
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </motion.button>
            </div>
          )}

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
}