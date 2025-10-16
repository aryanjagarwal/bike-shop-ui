"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, FileText, Bike, Loader2, CheckCircle } from "lucide-react";
import { useCreateBooking, type ServiceWithCategory } from "@/lib/api/serviceBookings";
import { useRouter } from "next/navigation";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceWithCategory | null;
}

export default function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const router = useRouter();
  const createBooking = useCreateBooking();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bookingDate: "",
    bookingTime: "",
    customerNotes: "",
    customerBikeDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    try {
      // Combine date and time into ISO strings
      const bookingDate = new Date(formData.bookingDate).toISOString();
      const bookingTime = new Date(`${formData.bookingDate}T${formData.bookingTime}`).toISOString();

      const response = await createBooking.mutateAsync({
        serviceId: service.id,
        bookingDate,
        bookingTime,
        customerNotes: formData.customerNotes || undefined,
        customerBikeDetails: formData.customerBikeDetails || undefined,
      });

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          router.push("/account/bookings");
        }, 2000);
      }
    } catch (error) {
      alert("Failed to create booking. Please try again.");
      console.error("Booking error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && service && (
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Created!</h3>
                    <p className="text-gray-600">Redirecting to your bookings...</p>
                  </div>
                </div>
              )}
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Book Service</h2>
                  <p className="text-sm text-gray-600 mt-1">{service.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Service Info */}
              <div className="p-6 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{service.category.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{service.estimatedDurationMinutes} mins</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="text-xl font-bold text-blue-600">£{service.basePrice}</p>
                  </div>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-3">{service.description}</p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={today}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Booking Time *
                    </label>
                    <input
                      type="time"
                      name="bookingTime"
                      value={formData.bookingTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bike Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Bike className="w-4 h-4 inline mr-2" />
                    Bike Details
                  </label>
                  <input
                    type="text"
                    name="customerBikeDetails"
                    value={formData.customerBikeDetails}
                    onChange={handleChange}
                    placeholder="e.g., Mountain bike, 2022 model, Trek Marlin 7"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Additional Notes
                  </label>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe any issues or special requirements..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
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
                    disabled={createBooking.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {createBooking.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Confirm Booking"
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
