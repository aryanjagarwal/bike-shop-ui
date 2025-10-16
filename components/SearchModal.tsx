"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Bike, Package } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useSearchAll, formatPrice, getProductUrl, getStockStatus, getStockStatusColor } from "@/lib/api/search";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchModal() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { isSearchOpen, toggleSearch } = useUIStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Use search API
  const { data, isLoading } = useSearchAll(
    {
      q: debouncedQuery,
      limit: 6,
      sortBy: 'relevance',
      sortOrder: 'desc',
    },
    debouncedQuery.trim().length > 0
  );

  const results = data?.results || [];

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isSearchOpen]);

  const handleViewAllResults = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      toggleSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleViewAllResults();
    }
  };

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
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
            >
            {/* Search Input */}
            <div className="p-4 border-b flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for bicycles, parts, brands..."
                className="flex-1 outline-none text-lg"
                autoFocus
              />
              {isLoading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
              <button
                onClick={toggleSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto p-4">
              {isLoading && debouncedQuery ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : debouncedQuery.trim() && results.length === 0 && !isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No products found for &quot;{debouncedQuery}&quot;
                  </p>
                  <button
                    onClick={handleViewAllResults}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all results
                  </button>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={getProductUrl(item)}
                        onClick={toggleSearch}
                      >
                        <motion.div
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          className="flex items-center gap-4 p-3 rounded-lg cursor-pointer"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {item.type === 'bicycle' ? (
                              <Bike className="w-6 h-6 text-blue-600" />
                            ) : (
                              <Package className="w-6 h-6 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">
                                {item.name}
                              </h3>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {item.brand} {item.model && `• ${item.model}`}
                            </p>
                            <p className={`text-xs ${getStockStatusColor(item)}`}>
                              {getStockStatus(item)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-600 font-bold">
                              {formatPrice(item.price)}
                            </div>
                            <div className="text-xs text-gray-400">
                              Score: {item.relevanceScore}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* View All Results Button */}
                  {data && data.pagination.total > 6 && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={handleViewAllResults}
                        className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View all {data.pagination.total} results →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search products</p>
                  <p className="text-sm mt-2">Press Enter to view all results</p>
                </div>
              )}
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
