"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { usePart, useFeaturedParts } from "@/lib/api/parts";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@clerk/nextjs";
import PartCard from "@/components/PartCard";

export default function PartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const partId = params.id as string;
  
  const { data: partData, isLoading, error } = usePart(partId);
  const { data: featuredData } = useFeaturedParts(4);
  const { toggle, isInWishlist } = useWishlist();
  const { addPart, isAdding, items, updateQuantity, isUpdating, isItemInCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const part = partData?.data;
  const relatedProducts = featuredData?.data || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading part details...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !part) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Part Not Found</h1>
          <button
            onClick={() => router.push("/shop/parts")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(part.id);
  const productReviews = part.reviews || [];
  const images = part.images?.map(img => img.cloudinaryUrl) || [];
  const price = parseFloat(part.price);
  const rating = part.averageRating || 0;
  const reviewCount = part._count?.reviews || 0;
  
  // Check if item is in cart
  const isInCart = isItemInCart(undefined, part.id);
  const cartItem = items.find(item => item.partId === part.id);
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    
    const result = await addPart(part.id, quantity);
    if (result.success) {
      alert(`Added ${quantity} ${part.name} to cart!`);
    } else {
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    await toggle(part.id);
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!cartItem) return;
    await updateQuantity(cartItem.id, newQuantity);
  };

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-96 md:h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-4"
              >
                <Image
                  src={images[selectedImage] || '/placeholder-part.jpg'}
                  alt={part.name}
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 bg-gray-100 rounded-lg overflow-hidden ${
                      selectedImage === index ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${part.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">{part.brand}</p>
                <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-blue-600">
                    £{price.toLocaleString()}
                  </span>
                  {part.priceBreakdown && (
                    <div className="text-sm text-gray-500">
                      <p>Net: {part.priceBreakdown.formatted.netPrice}</p>
                      <p>VAT ({part.priceBreakdown.vatRatePercentage}%): {part.priceBreakdown.formatted.vatAmount}</p>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{part.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Stock: <span className="font-semibold text-green-600">{part.stockQuantity} available</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wrench className="w-4 h-4" />
                  <span>Installation Difficulty: <span className="font-semibold">{part.installationDifficulty}</span></span>
                </div>
              </div>

              {/* Quantity */}
              {!isInCart && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(part.stockQuantity, quantity + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                {!isInCart ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={part.stockQuantity === 0 || isAdding}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </motion.button>
                ) : (
                  <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg py-3 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">In Cart:</span>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateQuantity(Math.max(1, cartQuantity - 1))}
                          disabled={isUpdating || cartQuantity <= 1}
                          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <span className="w-12 text-center font-semibold text-blue-900">{cartQuantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateQuantity(Math.min(part.stockQuantity, cartQuantity + 1))}
                          disabled={isUpdating || cartQuantity >= part.stockQuantity}
                          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 text-blue-600" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleWishlist}
                  className={`p-3 border rounded-lg transition-colors ${
                    inWishlist
                      ? "bg-red-50 border-red-500 text-red-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${inWishlist ? "fill-current" : ""}`} />
                </motion.button>
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Free shipping on orders over £50</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>{part.warrantyPeriod || '1-year'} warranty included</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <RotateCcw className="w-5 h-5" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-4 font-semibold ${
                  activeTab === "description"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-6 py-4 font-semibold ${
                  activeTab === "specifications"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("compatibility")}
                className={`px-6 py-4 font-semibold ${
                  activeTab === "compatibility"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Compatibility
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-4 font-semibold ${
                  activeTab === "reviews"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Reviews ({productReviews.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">{part.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-semibold">{part.brand}</p>
                  </div>
                  {part.model && (
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-semibold">{part.model}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">SKU</p>
                    <p className="font-semibold">{part.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold">{part.category?.name || 'N/A'}</p>
                  </div>
                  {part.weight && (
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-semibold">{part.weight}</p>
                    </div>
                  )}
                  {part.warrantyPeriod && (
                    <div>
                      <p className="text-sm text-gray-500">Warranty</p>
                      <p className="font-semibold">{part.warrantyPeriod}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Specifications</h3>
                {part.specifications && part.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {part.specifications.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span className="font-semibold">{spec.specName}:</span>
                        <span className="text-gray-600">{spec.specValue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Brand:</span>
                      <span className="text-gray-600">{part.brand}</span>
                    </div>
                    {part.model && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Model:</span>
                        <span className="text-gray-600">{part.model}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">SKU:</span>
                      <span className="text-gray-600">{part.sku}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Installation:</span>
                      <span className="text-gray-600">{part.installationDifficulty}</span>
                    </div>
                    {part.weight && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Weight:</span>
                        <span className="text-gray-600">{part.weight}</span>
                      </div>
                    )}
                    {part.warrantyPeriod && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Warranty:</span>
                        <span className="text-gray-600">{part.warrantyPeriod}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "compatibility" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Compatible Bicycles</h3>
                {part.compatibleBicycles && part.compatibleBicycles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {part.compatibleBicycles.map((bike: any) => (
                      <div key={bike.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        {bike.images?.[0] && (
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={bike.images[0].cloudinaryUrl}
                              alt={bike.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{bike.name}</p>
                          <p className="text-sm text-gray-500">{bike.brand}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Compatibility information not available. Please contact us for details.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                {productReviews.length > 0 ? (
                  <div className="space-y-6">
                    {productReviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Featured Parts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedPart) => (
                <PartCard key={relatedPart.id} part={relatedPart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
