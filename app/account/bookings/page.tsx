"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMyBookings } from "@/lib/api/serviceBookings";
import { BookingStatus } from "@/lib/types/allTypes";
import {
  formatBookingStatus,
  getBookingStatusColor,
  formatPaymentStatus,
  getPaymentStatusColor,
} from "@/lib/api/serviceBookings";
import Link from "next/link";

export default function MyBookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);

  const { data: bookingsResponse, isLoading, error } = useMyBookings({
    page,
    limit: 10,
    status: statusFilter,
  });

  const handleStatusFilter = (status: BookingStatus | undefined) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">My Service Bookings</h1>
          <p className="text-gray-600">View and manage your service appointments</p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter(undefined)}
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
                onClick={() => handleStatusFilter(status)}
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
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Service Info */}
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

                        {/* Date & Time */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
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

                        {/* Customer Notes */}
                        {booking.customerNotes && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {booking.customerNotes}
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
                              ${booking.quotedPrice || booking.service.basePrice}
                            </p>
                          </div>
                          <Link
                            href={`/account/bookings/${booking.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter
                    ? `No bookings with status: ${formatBookingStatus(statusFilter)}`
                    : "You haven't made any service bookings yet"}
                </p>
                <Link
                  href="/services"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Browse Services
                </Link>
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
      </div>
    </div>
  );
}
