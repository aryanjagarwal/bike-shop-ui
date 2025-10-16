"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Package,
  Power,
  Filter,
} from "lucide-react";
import { useServiceCategories } from "@/lib/api/serviceBookings";
import {
  useAllServices,
  useDeleteService,
  useToggleServiceStatus,
} from "@/lib/api/admin/services";
import type { ServiceWithCategory } from "@/lib/api/admin/services";
import ServiceModal from "./ServiceModal";

export default function ServicesTab() {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithCategory | null>(null);

  const { data: categoriesResponse } = useServiceCategories();
  const { data: servicesResponse, isLoading, error } = useAllServices({
    categoryId: categoryFilter,
    includeInactive,
  });
  const deleteService = useDeleteService();
  const toggleStatus = useToggleServiceStatus();

  const handleCreateService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: ServiceWithCategory) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteService.mutateAsync(serviceId);
      alert("Service deleted successfully!");
    } catch (error) {
      alert("Failed to delete service. It may have active bookings.");
      console.error("Delete error:", error);
    }
  };

  const handleToggleStatus = async (serviceId: string) => {
    try {
      await toggleStatus.mutateAsync(serviceId);
    } catch (error) {
      alert("Failed to toggle service status.");
      console.error("Toggle error:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Services</h2>
          <p className="text-sm text-gray-600">Manage individual service offerings</p>
        </div>
        <button
          onClick={handleCreateService}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Service
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select
              value={categoryFilter || ""}
              onChange={(e) => setCategoryFilter(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Categories</option>
              {categoriesResponse?.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Include Inactive */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include inactive services</span>
            </label>
          </div>
        </div>
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
          <h3 className="text-lg font-semibold mb-2">Failed to load services</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      )}

      {/* Services Grid */}
      {servicesResponse?.data && (
        <>
          {servicesResponse.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesResponse.data.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{service.name}</h3>
                      <p className="text-xs text-gray-500">{service.category.name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-semibold text-blue-600">£{service.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{service.estimatedDurationMinutes} mins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diagnosis Required</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          service.requiresDiagnosis
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.requiresDiagnosis ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(service.id)}
                      disabled={toggleStatus.isPending}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                        service.isActive
                          ? "bg-amber-600 text-white hover:bg-amber-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      disabled={deleteService.isPending}
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
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                {categoryFilter
                  ? "No services in this category"
                  : "Create your first service to get started"}
              </p>
              <button
                onClick={handleCreateService}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Service
              </button>
            </div>
          )}
        </>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </div>
  );
}
