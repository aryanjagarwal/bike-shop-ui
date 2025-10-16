"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useServiceCategory } from "@/lib/api/serviceBookings";
import ServiceCard from "@/components/services/ServiceCard";
import BookingModal from "@/components/services/BookingModal";
import type { ServiceWithCategory } from "@/lib/api/serviceBookings";

export default function ServiceCategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  
  const { data: categoryResponse, isLoading, error } = useServiceCategory(categoryId);
  const [selectedService, setSelectedService] = useState<ServiceWithCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookService = (service: ServiceWithCategory) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !categoryResponse?.data) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load category</h3>
            <p className="text-gray-600 mb-6">Please try again later</p>
            <Link
              href="/services"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const category = categoryResponse.data;

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-gray-600">{category.description}</p>
          )}
        </motion.div>

        {/* Services Grid */}
        {category.services && category.services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.services.map((service) => {
              // Transform service to include category
              const serviceWithCategory: ServiceWithCategory = {
                ...service,
                category: {
                  id: category.id,
                  name: category.name,
                  description: category.description,
                  isActive: category.isActive,
                  createdAt: category.createdAt,
                  updatedAt: category.updatedAt,
                },
              };

              return (
                <ServiceCard
                  key={service.id}
                  service={serviceWithCategory}
                  onBook={handleBookService}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No services available in this category</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </div>
  );
}
