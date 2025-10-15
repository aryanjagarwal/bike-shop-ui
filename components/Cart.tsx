"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import Image from "next/image";
import Link from "next/link";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, summary, count, updateQuantity, remove, isUpdating, isRemoving } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Shopping Cart
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {count === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-2">Add some items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
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
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                          <Link href={productUrl} onClick={onClose}>
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={productUrl} onClick={onClose}>
                            <h3 className="font-semibold text-sm truncate hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                          <p className="text-blue-600 font-bold mt-1">
                            £{unitPrice.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={isUpdating || item.quantity <= 1}
                              className="p-1 hover:bg-white rounded transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, Math.min(product.stockQuantity, item.quantity + 1))}
                              disabled={isUpdating || item.quantity >= product.stockQuantity}
                              className="p-1 hover:bg-white rounded transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(item.id)}
                              disabled={isRemoving}
                              className="ml-auto p-1 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {count > 0 && summary && (
              <div className="border-t p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{summary.formatted.total}</span>
                </div>
                <Link href="/checkout" onClick={onClose}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Checkout
                  </motion.button>
                </Link>
                <Link href="/cart" onClick={onClose}>
                  <button className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    View Full Cart
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
