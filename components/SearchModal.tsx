"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { products } from "@/lib/data";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function SearchModal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const { isSearchOpen, toggleSearch } = useUIStore();

  useEffect(() => {
    if (query.trim()) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.subCategory.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSearch}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl z-50 mx-4"
          >
            {/* Search Input */}
            <div className="p-4 border-b flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="flex-1 outline-none text-lg"
                autoFocus
              />
              <button
                onClick={toggleSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto p-4">
              {query.trim() && results.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No products found for "{query}"
                </p>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={toggleSearch}
                    >
                      <motion.div
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="flex items-center gap-4 p-3 rounded-lg cursor-pointer"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.brand} • {product.subCategory}
                          </p>
                        </div>
                        <div className="text-blue-600 font-bold">
                          {formatPrice(product.price)}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search products</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
