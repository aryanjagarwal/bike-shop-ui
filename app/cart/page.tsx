"use client";

import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Tag, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAvailableCoupons, useApplyCoupon } from "@/lib/api/coupons";
import { useGetShippingSettings, calculateShippingCost, qualifiesForFreeShipping, amountNeededForFreeShipping } from "@/lib/api/shipping";
import { useState } from "react";
import { setCheckoutData } from "@/lib/utils/checkoutData";

export default function CartPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { 
    cart, 
    items, 
    summary, 
    count,
    isLoading, 
    updateQuantity, 
    remove, 
    clear,
    isUpdating,
    isRemoving 
  } = useCart();

  // Coupon state
  const [showCoupons, setShowCoupons] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string;
    couponCode: string;
    discountAmount: number;
    discountType: string;
    finalAmount: number;
  } | null>(null);

  const { data: couponsData, isLoading: couponsLoading } = useAvailableCoupons();
  const applyCouponMutation = useApplyCoupon();
  const { data: shippingSettingsData } = useGetShippingSettings();

  // Redirect to login if not signed in
  if (!isSignedIn) {
    router.push('/auth/login');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (count === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-gray-600">{count} {count === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <Link href="/shop/bicycles">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const bicycle = item.bicycle;
              const part = item.part;
              const product = bicycle || part;
              
              if (!product) return null;

              let imageUrl = '/placeholder-bike.jpg';
              if (bicycle) {
                const primaryImage = bicycle.images?.find((img) => img.isPrimary) || bicycle.images?.[0];
                imageUrl = primaryImage?.cloudinaryUrl || '/placeholder-bike.jpg';
              } else if (part) {
                const primaryImage = part.images?.find((img) => img.isPrimary) || part.images?.[0];
                imageUrl = primaryImage?.cloudinaryUrl || '/placeholder-part.jpg';
              }
              
              const unitPrice = parseFloat(item.unitPrice);
              const productUrl = bicycle ? `/shop/bicycles/${bicycle.id}` : `/shop/parts/${part?.id}`;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Link href={productUrl}>
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-2">
                        <div>
                          <Link href={productUrl}>
                            <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {product.brand}
                            {bicycle && ` • ${bicycle.model}`}
                            {part && part.model && ` • ${part.model}`}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {bicycle && (
                              <>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {bicycle.frameSize}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {bicycle.color}
                                </span>
                              </>
                            )}
                            {part && (
                              <>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {part.sku}
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  Part
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          disabled={isRemoving}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(product.stockQuantity, item.quantity + 1))}
                            disabled={isUpdating || item.quantity >= product.stockQuantity}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {item.priceBreakdown.formatted.grossPrice}
                          </p>
                          <p className="text-sm text-gray-500">
                            £{unitPrice.toLocaleString()} each
                          </p>
                        </div>
                      </div>

                      {/* Stock warning */}
                      {product.stockQuantity <= 5 && (
                        <p className="text-xs text-orange-600 mt-2">
                          Only {product.stockQuantity} left in stock
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <button
              onClick={clear}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {summary && (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({count} items)</span>
                      <span className="font-semibold">{summary.formatted.total}</span>
                    </div>

                    {/* View Breakdown Toggle */}
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {showBreakdown ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Breakdown
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Breakdown
                        </>
                      )}
                    </button>

                    {/* Breakdown Details */}
                    {showBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 space-y-2 border-l-2 border-gray-200"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Net Amount</span>
                          <span className="font-medium">{summary.formatted.netAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">VAT ({summary.currency === 'GBP' ? '20%' : 'Tax'})</span>
                          <span className="font-medium">{summary.formatted.vatAmount}</span>
                        </div>
                      </motion.div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          Discount ({appliedCoupon.couponCode})
                        </span>
                        <span className="font-semibold">-£{appliedCoupon.discountAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">
                        {(() => {
                          const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : summary.total;
                          const shipping = calculateShippingCost(finalAmount, shippingSettingsData?.data);
                          return shipping === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `£${shipping.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          );
                        })()}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-blue-600">
                        {(() => {
                          const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : summary.total;
                          const shipping = calculateShippingCost(finalAmount, shippingSettingsData?.data);
                          const total = finalAmount + shipping;
                          return `£${total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Banner */}
                  {shippingSettingsData?.data && (() => {
                    const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : summary.total;
                    const isFreeShipping = qualifiesForFreeShipping(finalAmount, shippingSettingsData.data);
                    const amountNeeded = amountNeededForFreeShipping(finalAmount, shippingSettingsData.data);
                    
                    if (isFreeShipping) {
                      return (
                        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 You qualify for FREE shipping!
                          </p>
                        </div>
                      );
                    } else if (amountNeeded > 0) {
                      return (
                        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                          <p className="text-sm text-blue-800">
                            Add <span className="font-semibold">£{amountNeeded.toFixed(2)}</span> more to get FREE shipping!
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Coupon Section */}
                  <div className="mb-6">
                    {!appliedCoupon ? (
                      <button
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Tag className="w-4 h-4" />
                        {showCoupons ? 'Hide Coupons' : 'Apply Coupon'}
                      </button>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-green-800">
                                Coupon Applied: {appliedCoupon.couponCode}
                              </p>
                              <p className="text-xs text-green-600">
                                You saved £{appliedCoupon.discountAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAppliedCoupon(null)}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-green-700" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Coupons List */}
                    {showCoupons && !appliedCoupon && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 max-h-64 overflow-y-auto"
                      >
                        {couponsLoading ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          </div>
                        ) : couponsData?.data && couponsData.data.length > 0 ? (
                          couponsData.data.map((userCoupon) => {
                            const coupon = userCoupon.coupon;
                            if (!coupon) return null;

                            const minAmount = parseFloat(coupon.minOrderAmount);
                            // summary.total is in pounds
                            const cartTotalInPounds = summary.total;
                            const isEligible = cartTotalInPounds >= minAmount;

                            return (
                              <div
                                key={userCoupon.id}
                                className={`p-3 border rounded-lg ${
                                  isEligible
                                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                    : 'border-gray-200 bg-gray-50 opacity-60'
                                } transition-colors`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Tag className="w-4 h-4 text-blue-600" />
                                      <span className="font-bold text-sm">{coupon.code}</span>
                                      <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">
                                        {coupon.discountType === 'PERCENTAGE'
                                          ? `${coupon.discountValue}% OFF`
                                          : `£${coupon.discountValue} OFF`}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-1">{coupon.name}</p>
                                    {coupon.description && (
                                      <p className="text-xs text-gray-500">{coupon.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      Min. order: £{minAmount.toFixed(2)}
                                    </p>
                                    {!isEligible && (
                                      <p className="text-xs text-red-500 mt-1">
                                        Add £{(minAmount - cartTotalInPounds).toFixed(2)} more to use this coupon
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (isEligible) {
                                        applyCouponMutation.mutate(
                                          {
                                            couponId: coupon.id,
                                            cartTotal: cartTotalInPounds,
                                          },
                                          {
                                            onSuccess: (data) => {
                                              setAppliedCoupon(data.data);
                                              setShowCoupons(false);
                                            },
                                            onError: (error) => {
                                              console.error('Failed to apply coupon:', error);
                                            },
                                          }
                                        );
                                      }
                                    }}
                                    disabled={!isEligible || applyCouponMutation.isPending}
                                    className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {applyCouponMutation.isPending ? 'Applying...' : 'Apply'}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No coupons available
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <motion.button
                    onClick={() => {
                      // Calculate final amounts
                      const finalAmount = appliedCoupon 
                        ? appliedCoupon.finalAmount 
                        : summary.total;
                      
                      const shippingCost = calculateShippingCost(
                        finalAmount,
                        shippingSettingsData?.data
                      );
                      
                      // Prepare and store checkout data
                      setCheckoutData({
                        subtotal: summary.total,
                        discount: appliedCoupon ? appliedCoupon.discountAmount : 0,
                        couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
                        couponId: appliedCoupon ? appliedCoupon.couponId : null,
                        shipping: shippingCost,
                        total: finalAmount,
                      });
                      
                      // Navigate to checkout
                      router.push('/checkout');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <Link href="/shop/bicycles">
                    <button className="w-full mt-3 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      Continue Shopping
                    </button>
                  </Link>

                  {/* Price Breakdown Info */}
                  <div className="mt-6 pt-6 border-t text-xs text-gray-500 space-y-1">
                    <p>• All prices include VAT</p>
                    <p>• Free shipping on orders over £50</p>
                    <p>• Secure checkout with encryption</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
