"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Bike,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useSearchAll,
  useSearchBicycles,
  useSearchParts,
  formatPrice,
  getProductUrl,
  getStockStatus,
  getStockStatusColor,
  formatSearchTime,
  type SearchParams,
} from "@/lib/api/search";

type SearchType = "all" | "bicycles" | "parts";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial query from URL
  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as SearchType) || "all";

  // Search state
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<SearchParams, "q">>({
    page: 1,
    limit: 20,
    sortBy: "relevance",
    sortOrder: "desc",
    inStockOnly: false,
  });

  // Facet expansion state
  const [expandedFacets, setExpandedFacets] = useState({
    brands: true,
    categories: true,
    priceRanges: false,
  });

  // Build search params
  const searchQueryParams: SearchParams = {
    q: query,
    ...filters,
  };

  // Use appropriate search hook based on type
  const allSearch = useSearchAll(searchQueryParams, searchType === "all" && query.length > 0);
  const bicyclesSearch = useSearchBicycles(
    searchQueryParams,
    searchType === "bicycles" && query.length > 0
  );
  const partsSearch = useSearchParts(searchQueryParams, searchType === "parts" && query.length > 0);

  // Get active search data
  const activeSearch =
    searchType === "all" ? allSearch : searchType === "bicycles" ? bicyclesSearch : partsSearch;

  const { data, isLoading, error } = activeSearch;

  //console.log("Search data:", data);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      setFilters((prev) => ({ ...prev, page: 1 })); // Reset to page 1
      updateURL(searchInput.trim(), searchType, { ...filters, page: 1 });
    }
    console.log("Search input:", searchInput);
  };

  // Update URL with search params
  const updateURL = (q: string, type: SearchType, currentFilters: typeof filters) => {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("type", type);
    if (currentFilters.page && currentFilters.page > 1) {
      params.set("page", currentFilters.page.toString());
    }
    router.push(`/search?${params.toString()}`);
  };

  // Handle search type change
  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    setFilters((prev) => ({ ...prev, page: 1 }));
    if (query) {
      updateURL(query, type, { ...filters, page: 1 });
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "relevance",
      sortOrder: "desc",
      inStockOnly: false,
    });
  };

  // Toggle facet expansion
  const toggleFacet = (facet: keyof typeof expandedFacets) => {
    setExpandedFacets((prev) => ({ ...prev, [facet]: !prev[facet] }));
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for bicycles, parts, brands..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>

          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => handleTypeChange("bicycles")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === "bicycles"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Bike className="w-4 h-4" />
              Bicycles
            </button>
            <button
              onClick={() => handleTypeChange("parts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === "parts"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Package className="w-4 h-4" />
              Parts
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value as SearchParams["sortBy"])
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price">Price</option>
                      <option value="name">Name</option>
                      <option value="createdAt">Newest</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        handleFilterChange("sortOrder", e.target.value as "asc" | "desc")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "minPrice",
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "maxPrice",
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* In Stock Only */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="inStockOnly"
                      checked={filters.inStockOnly}
                      onChange={(e) => handleFilterChange("inStockOnly", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="inStockOnly" className="text-sm text-gray-700">
                      In Stock Only
                    </label>
                  </div>

                  {/* Facets */}
                  {data?.facets && (
                    <>
                      {/* Brands */}
                      {data.facets.brands.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleFacet("brands")}
                            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
                          >
                            <span>Brands</span>
                            {expandedFacets.brands ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {expandedFacets.brands && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {data.facets.brands.map((brand) => (
                                <button
                                  key={brand.name}
                                  onClick={() =>
                                    handleFilterChange(
                                      "brand",
                                      filters.brand === brand.name ? undefined : brand.name
                                    )
                                  }
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    filters.brand === brand.name
                                      ? "bg-blue-100 text-blue-700"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {brand.name} ({brand.count})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Categories */}
                      {data.facets.categories.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleFacet("categories")}
                            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
                          >
                            <span>Categories</span>
                            {expandedFacets.categories ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {expandedFacets.categories && (
                            <div className="space-y-2">
                              {data.facets.categories.map((category) => (
                                <button
                                  key={category.name}
                                  onClick={() =>
                                    handleFilterChange(
                                      "category",
                                      filters.category === category.name ? undefined : category.name
                                    )
                                  }
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    filters.category === category.name
                                      ? "bg-blue-100 text-blue-700"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {category.name} ({category.count})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Results Header */}
            {query && data && (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-600">
                    Found <span className="font-semibold">{data.pagination.total}</span> results for{" "}
                    <span className="font-semibold">&quot;{query}&quot;</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Search completed in {formatSearchTime(data.searchTime)}
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search Failed</h3>
                <p className="text-gray-600">Please try again later</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && query && data?.results.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* No Query State */}
            {!query && (
              <div className="text-center py-20 bg-white rounded-lg">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
                <p className="text-gray-600">
                  Enter a search term to find bicycles and parts
                </p>
              </div>
            )}

            {/* Results Grid */}
            {data && data.results.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.results.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={getProductUrl(item)}
                        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {item.type === "bicycle" ? (
                            <Bike className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Package className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {item.type}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.brand} {item.model && `• ${item.model}`}
                        </p>

                        {item.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatPrice(item.price)}
                            </p>
                            <p className={`text-xs ${getStockStatusColor(item)}`}>
                              {getStockStatus(item)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            Score: {item.relevanceScore}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(data.pagination.page - 1)}
                      disabled={!data.pagination.hasPrev}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(data.pagination.page + 1)}
                      disabled={!data.pagination.hasNext}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
