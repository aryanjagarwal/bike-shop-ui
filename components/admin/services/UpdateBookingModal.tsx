"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle } from "lucide-react";
import { useUpdateBookingStatus } from "@/lib/api/admin/services";
import { BookingStatus } from "@/lib/types/allTypes";
import { formatBookingStatus } from "@/lib/api/serviceBookings";
import type { AdminServiceBooking } from "@/lib/api/admin/services";

interface UpdateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminServiceBooking | null;
}

export default function UpdateBookingModal({
  isOpen,
  onClose,
  booking,
}: UpdateBookingModalProps) {
  const updateBookingStatus = useUpdateBookingStatus();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    status: BookingStatus.PENDING,
    technicianNotes: "",
    quotedPrice: "",
    finalPrice: "",
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        status: booking.status,
        technicianNotes: booking.technicianNotes || "",
        quotedPrice: booking.quotedPrice || "",
        finalPrice: booking.finalPrice || "",
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      await updateBookingStatus.mutateAsync({
        bookingId: booking.id,
        data: {
          status: formData.status,
          technicianNotes: formData.technicianNotes || undefined,
          quotedPrice: formData.quotedPrice ? parseFloat(formData.quotedPrice) : undefined,
          finalPrice: formData.finalPrice ? parseFloat(formData.finalPrice) : undefined,
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      alert("Failed to update booking. Please try again.");
      console.error("Update error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && booking && (
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
                      Booking Updated!
                    </h3>
                    <p className="text-gray-600">Changes saved successfully</p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Update Booking</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.service.name} - {booking.user.firstName} {booking.user.lastName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Booking Info */}
              <div className="p-6 bg-blue-50 border-b border-blue-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-medium">{booking.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-medium">
                      {new Date(booking.bookingTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Base Price</p>
                    <p className="font-medium">£{booking.service.basePrice}</p>
                  </div>
                </div>
                {booking.customerNotes && (
                  <div className="mt-3">
                    <p className="text-gray-600 text-sm">Customer Notes:</p>
                    <p className="text-sm">{booking.customerNotes}</p>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.values(BookingStatus).map((status) => (
                      <option key={status} value={status}>
                        {formatBookingStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quoted Price (£)
                    </label>
                    <input
                      type="number"
                      name="quotedPrice"
                      value={formData.quotedPrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 50.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Price (£)
                    </label>
                    <input
                      type="number"
                      name="finalPrice"
                      value={formData.finalPrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 75.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Technician Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technician Notes
                  </label>
                  <textarea
                    name="technicianNotes"
                    value={formData.technicianNotes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add notes about the service, parts needed, etc..."
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
                    disabled={updateBookingStatus.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updateBookingStatus.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Booking"
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
