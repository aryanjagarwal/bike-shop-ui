"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Package,
} from "lucide-react";
import { useServiceCategories } from "@/lib/api/serviceBookings";
import {
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
} from "@/lib/api/admin/services";
import type { ServiceCategory } from "@/lib/types/allTypes";
import CategoryModal from "./CategoryModal";

export default function CategoriesTab() {
  const { data: categoriesResponse, isLoading, error } = useServiceCategories();
  const deleteCategory = useDeleteServiceCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: any) => {
    // Convert ServiceCategoryWithServices to ServiceCategory for the modal
    const categoryData: ServiceCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
    setSelectedCategory(categoryData);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCategory.mutateAsync(categoryId);
      alert("Category deleted successfully!");
    } catch (error) {
      alert("Failed to delete category. It may have associated services.");
      console.error("Delete error:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Service Categories</h2>
          <p className="text-sm text-gray-600">Manage service category groups</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

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
          <h3 className="text-lg font-semibold mb-2">Failed to load categories</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      )}

      {/* Categories Grid */}
      {categoriesResponse?.data && (
        <>
          {categoriesResponse.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesResponse.data.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderTree className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{category.services?.length || 0} services</span>
                    <span
                      className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={deleteCategory.isPending}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg">
              <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">Create your first service category to get started</p>
              <button
                onClick={handleCreateCategory}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </button>
            </div>
          )}
        </>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
      />
    </div>
  );
}
