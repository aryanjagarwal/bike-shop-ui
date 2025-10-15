"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, Filter, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAdminParts, useDeletePart } from "@/lib/api/admin/parts";
import { usePartCategories } from "@/lib/api/parts";

export default function AdminPartsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  
  const { data, isLoading, error } = useAdminParts({
    page,
    limit: 20,
    categoryId,
    brand,
  });

  const { data: categoriesData } = usePartCategories();
  const categories = categoriesData?.data || [];

  const deletePart = useDeletePart();

  const parts = data?.data || [];
  const pagination = (data as any)?.pagination;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deletePart.mutate(id, {
        onSuccess: () => {
          alert("Part deleted successfully");
        },
        onError: (error) => {
          alert("Failed to delete part");
          console.error(error);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Parts Management</h2>
            <p className="text-gray-600 mt-1">
              Manage your parts inventory
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/parts/categories">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Manage Categories
              </button>
            </Link>
            <Link href="/admin/parts/create">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Part
              </button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by brand..."
            value={brand || ""}
            onChange={(e) => setBrand(e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={() => {
              setSearch("");
              setCategoryId(undefined);
              setBrand(undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-red-600">Failed to load parts</p>
        </div>
      )}

      {/* Parts Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Part
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Brand
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => {
                  const primaryImage = part.images?.find((img) => img.isPrimary) || part.images?.[0];
                  const price = parseFloat(part.price);

                  return (
                    <tr key={part.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.cloudinaryUrl}
                                alt={part.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{part.name}</p>
                            <p className="text-sm text-gray-500">{part.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {part.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{part.brand}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">£{price.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            part.stockQuantity > 10
                              ? "bg-green-100 text-green-700"
                              : part.stockQuantity > 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {part.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 rounded text-xs inline-block ${
                              part.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {part.isActive ? "Active" : "Inactive"}
                          </span>
                          {part.isFeatured && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 inline-block">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/parts/${part.id}`}>
                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(part.id, part.name)}
                            disabled={deletePart.isPending}
                            className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {parts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No parts found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
