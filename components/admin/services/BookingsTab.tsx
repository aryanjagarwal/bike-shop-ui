"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
} from "lucide-react";
import { useAllBookings, useUpdateBookingStatus } from "@/lib/api/admin/services";
import { BookingStatus } from "@/lib/types/allTypes";
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatPaymentStatus,
  getPaymentStatusColor,
} from "@/lib/api/serviceBookings";
import UpdateBookingModal from "./UpdateBookingModal";
import type { AdminServiceBooking } from "@/lib/api/admin/services";

export default function BookingsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const [selectedBooking, setSelectedBooking] = useState<AdminServiceBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: bookingsResponse, isLoading, error } = useAllBookings({
    page,
    limit: 10,
    status: statusFilter,
  });

  const handleEditBooking = (booking: AdminServiceBooking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === undefined
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {Object.values(BookingStatus).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {formatBookingStatus(status)}
            </button>
          ))}
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
          <h3 className="text-lg font-semibold mb-2">Failed to load bookings</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      )}

      {/* Bookings List */}
      {bookingsResponse?.data && (
        <>
          {bookingsResponse.data.length > 0 ? (
            <div className="space-y-4">
              {bookingsResponse.data.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{booking.service.name}</h3>
                          <p className="text-sm text-gray-600">
                            {booking.service.category.name}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span>
                          {booking.user.firstName} {booking.user.lastName} ({booking.user.email})
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(booking.bookingTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.customerNotes && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          <span className="font-medium">Customer Notes:</span> {booking.customerNotes}
                        </p>
                      )}
                      {booking.technicianNotes && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          <span className="font-medium">Technician Notes:</span>{" "}
                          {booking.technicianNotes}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-start lg:items-end gap-3">
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

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="text-lg font-bold text-blue-600">
                            £{booking.finalPrice || booking.quotedPrice || booking.service.basePrice}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {statusFilter
                  ? `No bookings with status: ${formatBookingStatus(statusFilter)}`
                  : "No bookings available"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {bookingsResponse.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!bookingsResponse.pagination.hasPrev}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {bookingsResponse.pagination.page} of{" "}
                {bookingsResponse.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!bookingsResponse.pagination.hasNext}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Update Booking Modal */}
      <UpdateBookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
      />
    </div>
  );
}
