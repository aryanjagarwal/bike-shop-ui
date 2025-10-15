"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAllBicycles } from "@/lib/api/bicycles";
import { useDeleteBicycle } from "@/lib/api/admin/bicycles";
import { BicycleCategory } from "@/lib/types/allTypes";

export default function AdminBicyclesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<BicycleCategory | undefined>();
  
  const { data, isLoading, error } = useAllBicycles({
    page,
    limit: 20,
    category,
    search,
  });

  const deleteBicycle = useDeleteBicycle();

  const bicycles = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteBicycle.mutate(id, {
        onSuccess: () => {
          alert("Bicycle deleted successfully");
        },
        onError: (error) => {
          alert("Failed to delete bicycle");
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
            <h2 className="text-2xl font-bold">Bicycle Management</h2>
            <p className="text-gray-600 mt-1">
              Manage your bicycle inventory
            </p>
          </div>
          <Link href="/admin/bicycles/create">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Bicycle
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bicycles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={category || ""}
            onChange={(e) =>
              setCategory(e.target.value as BicycleCategory | undefined)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value={BicycleCategory.ROAD}>Road</option>
            <option value={BicycleCategory.MOUNTAIN}>Mountain</option>
            <option value={BicycleCategory.HYBRID}>Hybrid</option>
            <option value={BicycleCategory.ELECTRIC}>Electric</option>
            <option value={BicycleCategory.KIDS}>Kids</option>
            <option value={BicycleCategory.BMX}>BMX</option>
            <option value={BicycleCategory.FOLDING}>Folding</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setCategory(undefined);
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
          <p className="mt-4 text-gray-600">Loading bicycles...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-red-600">Failed to load bicycles</p>
        </div>
      )}

      {/* Bicycles Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Bicycle
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Category
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
                {bicycles.map((bicycle) => {
                  const primaryImage = bicycle.images?.find((img) => img.isPrimary) || bicycle.images?.[0];
                  const price = parseFloat(bicycle.price);

                  return (
                    <tr key={bicycle.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.cloudinaryUrl}
                                alt={bicycle.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {bicycle.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {bicycle.brand} - {bicycle.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {bicycle.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        £{price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            bicycle.stockQuantity === 0
                              ? "bg-red-100 text-red-800"
                              : bicycle.stockQuantity <= 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {bicycle.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            bicycle.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {bicycle.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/bicycles/${bicycle.id}/edit`}>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(bicycle.id, bicycle.name)}
                            disabled={deleteBicycle.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
          {bicycles.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No bicycles found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {bicycles.length} of {pagination.total} bicycles
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
