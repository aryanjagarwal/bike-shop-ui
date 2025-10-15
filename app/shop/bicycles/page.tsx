"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import BicycleCard from "@/components/BicycleCard";
import { useSearchParams } from "next/navigation";
import { useAllBicycles } from "@/lib/api/bicycles";
import { BicycleCategory } from "@/lib/types/allTypes";

// Available categories and brands for filters
const CATEGORIES = [
  { value: BicycleCategory.ROAD, label: "Road" },
  { value: BicycleCategory.MOUNTAIN, label: "Mountain" },
  { value: BicycleCategory.HYBRID, label: "Hybrid" },
  { value: BicycleCategory.ELECTRIC, label: "Electric" },
  { value: BicycleCategory.KIDS, label: "Kids" },
  { value: BicycleCategory.BMX, label: "BMX" },
  { value: BicycleCategory.FOLDING, label: "Folding" },
];

const BRANDS = ["Specialized", "Trek", "Giant", "Cannondale", "Scott", "Bianchi"];

function BicyclesShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as BicycleCategory | null;
  
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<BicycleCategory | undefined>(
    initialCategory || undefined
  );
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch bicycles with filters
  const { data, isLoading, error } = useAllBicycles({
    page,
    limit,
    category: selectedCategory,
    brand: selectedBrand,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
    sortBy,
    sortOrder,
  });

  const bicycles = data?.data || [];
  const pagination = data?.pagination;

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setPriceRange([0, 5000]);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as ['price' | 'name' | 'createdAt', 'asc' | 'desc'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-lg mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.value}
                onChange={() => {
                  setSelectedCategory(cat.value);
                  setPage(1);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-bold text-lg mb-3">Brands</h3>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === brand}
                onChange={() => {
                  setSelectedBrand(brand);
                  setPage(1);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-lg mb-3">Price Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => {
              setPriceRange([0, parseInt(e.target.value)]);
              setPage(1);
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>£{priceRange[0]}</span>
            <span>£{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-4xl font-bold mb-2">Shop Bicycles</h1>
          <p className="text-gray-600">
            Discover our collection of premium bicycles
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <p className="text-gray-600">
                  {isLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <span className="font-semibold">{pagination?.total || 0}</span>{" "}
                      products found
                    </>
                  )}
                </p>
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white rounded-lg shadow-sm p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-xl">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSection />
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">
                  Error loading bicycles. Please try again.
                </p>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && bicycles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bicycles.map((bicycle, index) => (
                  <motion.div
                    key={bicycle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BicycleCard bicycle={bicycle} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && bicycles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No bicycles found matching your criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 border rounded-lg ${
                            page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BicyclesShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-4xl font-bold mb-2">Shop Bicycles</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <BicyclesShopContent />
    </Suspense>
  );
}
