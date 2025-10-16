"use client";

import { motion } from "framer-motion";
import { Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ServiceCategoryWithServices } from "@/lib/api/serviceBookings";

interface ServiceCategoryCardProps {
  category: ServiceCategoryWithServices;
  index: number;
}

export default function ServiceCategoryCard({ category, index }: ServiceCategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Wrench className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
          {category.description && (
            <p className="text-gray-600 text-sm">{category.description}</p>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-2 mb-4">
        {category.services.slice(0, 3).map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-sm text-gray-700">{service.name}</span>
            <span className="text-sm font-semibold text-blue-600">
              £{service.basePrice}
            </span>
          </div>
        ))}
        {category.services.length > 3 && (
          <p className="text-xs text-gray-500 pt-2">
            +{category.services.length - 3} more services
          </p>
        )}
      </div>

      {/* View Details Button */}
      <Link
        href={`/services/${category.id}`}
        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        View Services
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
