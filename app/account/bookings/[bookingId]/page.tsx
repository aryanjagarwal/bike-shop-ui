"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Package,
  User,
  FileText,
  Bike,
  DollarSign,
  Edit,
  X as XIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useBooking, useUpdateBooking, useCancelBooking } from "@/lib/api/serviceBookings";
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatPaymentStatus,
  getPaymentStatusColor,
} from "@/lib/api/serviceBookings";
import { BookingStatus } from "@/lib/types/allTypes";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const { data: bookingResponse, isLoading, error } = useBooking(bookingId);
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();

  const [isEditing, setIsEditing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [editForm, setEditForm] = useState({
    bookingDate: "",
    bookingTime: "",
    customerNotes: "",
    customerBikeDetails: "",
  });

  const booking = bookingResponse?.data;

  // Initialize edit form when booking loads
  const handleStartEdit = () => {
    if (booking) {
      const date = new Date(booking.bookingDate).toISOString().split("T")[0];
      const time = new Date(booking.bookingTime).toTimeString().slice(0, 5);
      
      setEditForm({
        bookingDate: date,
        bookingTime: time,
        customerNotes: booking.customerNotes || "",
        customerBikeDetails: booking.customerBikeDetails || "",
      });
      setIsEditing(true);
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      const bookingDate = new Date(editForm.bookingDate).toISOString();
      const bookingTime = new Date(`${editForm.bookingDate}T${editForm.bookingTime}`).toISOString();

      await updateBooking.mutateAsync({
        bookingId: booking.id,
        data: {
          bookingDate,
          bookingTime,
          customerNotes: editForm.customerNotes || undefined,
          customerBikeDetails: editForm.customerBikeDetails || undefined,
        },
      });

      setIsEditing(false);
      alert("Booking updated successfully!");
    } catch (error) {
      alert("Failed to update booking. Please try again.");
      console.error("Update error:", error);
    }
  };

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !cancelReason.trim()) return;

    try {
      await cancelBooking.mutateAsync({
        bookingId: booking.id,
        data: { reason: cancelReason },
      });

      setIsCancelling(false);
      alert("Booking cancelled successfully!");
      router.push("/account/bookings");
    } catch (error) {
      alert("Failed to cancel booking. Please try again.");
      console.error("Cancel error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load booking</h3>
            <p className="text-gray-600 mb-6">Please try again later</p>
            <Link
              href="/account/bookings"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = booking.status === BookingStatus.PENDING;
  const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{booking.service.name}</h1>
              <p className="text-gray-600">{booking.service.category.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(
                  booking.status
                )}`}
              >
                {formatBookingStatus(booking.status)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                  booking.paymentStatus
                )}`}
              >
                {formatPaymentStatus(booking.paymentStatus)}
              </span>
            </div>
          </div>

          {booking.service.description && (
            <p className="text-gray-600 mb-4">{booking.service.description}</p>
          )}

          {/* Actions */}
          {!isEditing && !isCancelling && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {canEdit && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Booking
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setIsCancelling(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                  Cancel Booking
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Edit Booking</h2>
            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={editForm.bookingDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bookingDate: e.target.value }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Time
                  </label>
                  <input
                    type="time"
                    value={editForm.bookingTime}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bookingTime: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bike Details
                </label>
                <input
                  type="text"
                  value={editForm.customerBikeDetails}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, customerBikeDetails: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={editForm.customerNotes}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, customerNotes: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateBooking.isPending}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateBooking.isPending ? "Updating..." : "Update Booking"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Cancel Form */}
        {isCancelling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4 text-red-600">Cancel Booking</h2>
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  required
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelling(false);
                    setCancelReason("");
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelBooking.isPending || !cancelReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelBooking.isPending ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">
                  {new Date(booking.bookingTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{booking.service.estimatedDurationMinutes} minutes</p>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Pricing
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium">${booking.service.basePrice}</span>
              </div>
              {booking.quotedPrice && booking.quotedPrice !== booking.service.basePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quoted Price</span>
                  <span className="font-medium">${booking.quotedPrice}</span>
                </div>
              )}
              {booking.finalPrice && (
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold">Final Price</span>
                  <span className="text-xl font-bold text-blue-600">${booking.finalPrice}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Customer Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {booking.user.firstName} {booking.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{booking.user.email}</p>
              </div>
              {booking.user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{booking.user.phone}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bike Details */}
          {booking.customerBikeDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bike className="w-5 h-5 text-blue-600" />
                Bike Details
              </h2>
              <p className="text-gray-700">{booking.customerBikeDetails}</p>
            </motion.div>
          )}
        </div>

        {/* Notes */}
        {booking.customerNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6 mt-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Customer Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{booking.customerNotes}</p>
          </motion.div>
        )}

        {/* Technician Notes */}
        {booking.technicianNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6 mt-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Technician Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{booking.technicianNotes}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
