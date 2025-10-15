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
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useBicycle, useSimilarBicycles } from "@/lib/api/bicycles";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@clerk/nextjs";
import BicycleCard from "@/components/BicycleCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const bicycleId = params.id as string;
  
  const { data: bicycleData, isLoading, error } = useBicycle(bicycleId);
  const { data: similarData } = useSimilarBicycles(bicycleId, 4);
  const { toggle, isInWishlist } = useWishlist();
  const { addBicycle, isAdding, items, updateQuantity, isUpdating, isItemInCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const bicycle = bicycleData?.data;
  const relatedProducts = similarData?.data || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bicycle details...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !bicycle) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Bicycle Not Found</h1>
          <button
            onClick={() => router.push("/shop/bicycles")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(bicycle.id);
  const productReviews = bicycle.reviews || [];
  const images = bicycle.images?.map(img => img.cloudinaryUrl) || [];
  const price = parseFloat(bicycle.price);
  const rating = bicycle.averageRating || 0;
  const reviewCount = bicycle._count?.reviews || 0;
  
  // Check if item is in cart
  const isInCart = isItemInCart(bicycle.id);
  const cartItem = items.find(item => item.bicycleId === bicycle.id);
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    
    const result = await addBicycle(bicycle.id, quantity);
    if (result.success) {
      // Show success message (you can add a toast notification here)
      alert(`Added ${quantity} ${bicycle.name} to cart!`);
    } else {
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    await toggle(bicycle.id);
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
                  src={images[selectedImage] || '/placeholder-bike.jpg'}
                  alt={bicycle.name}
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
                      alt={`${bicycle.name} ${index + 1}`}
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
                <p className="text-sm text-gray-500 mb-2">{bicycle.brand}</p>
                <h1 className="text-3xl font-bold mb-2">{bicycle.name}</h1>
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
                  {bicycle.priceBreakdown && (
                    <div className="text-sm text-gray-500">
                      <p>Net: {bicycle.priceBreakdown.formatted.netPrice}</p>
                      <p>VAT ({bicycle.priceBreakdown.vatRatePercentage}%): {bicycle.priceBreakdown.formatted.vatAmount}</p>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{bicycle.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Stock: <span className="font-semibold text-green-600">{bicycle.stockQuantity} available</span>
                </p>
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
                      onClick={() => setQuantity(Math.min(bicycle.stockQuantity, quantity + 1))}
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
                    disabled={bicycle.stockQuantity === 0 || isAdding}
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
                          onClick={() => handleUpdateQuantity(Math.min(bicycle.stockQuantity, cartQuantity + 1))}
                          disabled={isUpdating || cartQuantity >= bicycle.stockQuantity}
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
                  <span>Free shipping on orders over £500</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>2-year warranty included</span>
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
                <p className="text-gray-600 leading-relaxed">{bicycle.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Frame Size</p>
                    <p className="font-semibold">{bicycle.frameSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Frame Material</p>
                    <p className="font-semibold">{bicycle.frameMaterial}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-semibold">{bicycle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-semibold">{bicycle.year}</p>
                  </div>
                  {bicycle.weight && (
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-semibold">{bicycle.weight}</p>
                    </div>
                  )}
                  {bicycle.warrantyPeriod && (
                    <div>
                      <p className="text-sm text-gray-500">Warranty</p>
                      <p className="font-semibold">{bicycle.warrantyPeriod}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Specifications</h3>
                {bicycle.specifications && bicycle.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bicycle.specifications.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span className="font-semibold">{spec.name || spec.key}:</span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Brand:</span>
                      <span className="text-gray-600">{bicycle.brand}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Model:</span>
                      <span className="text-gray-600">{bicycle.model}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Category:</span>
                      <span className="text-gray-600">{bicycle.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Frame Size:</span>
                      <span className="text-gray-600">{bicycle.frameSize}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Frame Material:</span>
                      <span className="text-gray-600">{bicycle.frameMaterial}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold">Color:</span>
                      <span className="text-gray-600">{bicycle.color}</span>
                    </div>
                    {bicycle.weight && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Weight:</span>
                        <span className="text-gray-600">{bicycle.weight}</span>
                      </div>
                    )}
                    {bicycle.warrantyPeriod && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold">Warranty:</span>
                        <span className="text-gray-600">{bicycle.warrantyPeriod}</span>
                      </div>
                    )}
                  </div>
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
            <h2 className="text-2xl font-bold mb-6">Similar Bicycles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((bike) => (
                <BicycleCard key={bike.id} bicycle={bike} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
