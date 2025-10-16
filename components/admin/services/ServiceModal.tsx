"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle } from "lucide-react";
import { useServiceCategories } from "@/lib/api/serviceBookings";
import {
  useCreateService,
  useUpdateService,
} from "@/lib/api/admin/services";
import type { ServiceWithCategory } from "@/lib/api/admin/services";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceWithCategory | null;
}

export default function ServiceModal({
  isOpen,
  onClose,
  service,
}: ServiceModalProps) {
  const { data: categoriesResponse } = useServiceCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    serviceCategoryId: "",
    description: "",
    basePrice: "",
    estimatedDurationMinutes: "",
    requiresDiagnosis: false,
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        serviceCategoryId: service.serviceCategoryId,
        description: service.description || "",
        basePrice: service.basePrice,
        estimatedDurationMinutes: service.estimatedDurationMinutes.toString(),
        requiresDiagnosis: service.requiresDiagnosis,
        isActive: service.isActive,
      });
    } else {
      setFormData({
        name: "",
        serviceCategoryId: categoriesResponse?.data?.[0]?.id || "",
        description: "",
        basePrice: "",
        estimatedDurationMinutes: "",
        requiresDiagnosis: false,
        isActive: true,
      });
    }
  }, [service, categoriesResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (service) {
        // Update existing service
        await updateService.mutateAsync({
          serviceId: service.id,
          data: {
            name: formData.name,
            description: formData.description || undefined,
            basePrice: parseFloat(formData.basePrice),
            estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes),
            requiresDiagnosis: formData.requiresDiagnosis,
            isActive: formData.isActive,
          },
        });
      } else {
        // Create new service
        await createService.mutateAsync({
          name: formData.name,
          serviceCategoryId: formData.serviceCategoryId,
          description: formData.description || undefined,
          basePrice: parseFloat(formData.basePrice),
          estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes),
          requiresDiagnosis: formData.requiresDiagnosis,
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      alert(`Failed to ${service ? "update" : "create"} service. Please try again.`);
      console.error("Service error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isPending = createService.isPending || updateService.isPending;

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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Success Overlay */}
              {showSuccess && (
                <div className="absolute inset-0 bg-white/95 z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service ? "Service Updated!" : "Service Created!"}
                    </h3>
                    <p className="text-gray-600">Changes saved successfully</p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {service ? "Edit Service" : "Create Service"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Basic Tune-Up"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                {!service && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="serviceCategoryId"
                      value={formData.serviceCategoryId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categoriesResponse?.data?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the service..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (£) *
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      name="estimatedDurationMinutes"
                      value={formData.estimatedDurationMinutes}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="60"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requiresDiagnosis"
                      name="requiresDiagnosis"
                      checked={formData.requiresDiagnosis}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="requiresDiagnosis" className="text-sm font-medium text-gray-700">
                      Requires diagnosis before service
                    </label>
                  </div>

                  {service && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active (visible to customers)
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {service ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{service ? "Update Service" : "Create Service"}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
