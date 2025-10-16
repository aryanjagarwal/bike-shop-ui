"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, Calendar } from "lucide-react";
import type { ServiceWithCategory } from "@/lib/api/serviceBookings";

interface ServiceCardProps {
  service: ServiceWithCategory;
  onBook: (service: ServiceWithCategory) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{service.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{service.category.name}</p>
          {service.description && (
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
          )}
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{service.estimatedDurationMinutes} minutes</span>
        </div>
        {service.requiresDiagnosis && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <CheckCircle className="w-4 h-4" />
            <span>Requires diagnosis</span>
          </div>
        )}
      </div>

      {/* Price and Book Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-sm text-gray-500">Starting from</p>
          <p className="text-2xl font-bold text-blue-600">£{service.basePrice}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook(service)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Calendar className="w-4 h-4" />
          Book Now
        </motion.button>
      </div>
    </motion.div>
  );
}
