"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Edit,
  Eye,
  Settings,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useShippingSettings,
  useUpdateShippingSettings,
  getAvailableStatusTransitions,
  calculateOrderStatistics,
  formatOrderStatistics,
  type UpdateOrderStatusRequest,
} from "@/lib/api/admin/orders";
import {
  getOrderStatusColor,
  formatOrderStatus,
  getPaymentStatusColor,
  formatPaymentStatus,
} from "@/lib/api/orders";
import { OrderStatus } from "@/lib/types/allTypes";
import type { OrderWithDetails } from "@/lib/api/orders";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [sortBy, setSortBy] = useState<"createdAt" | "totalAmount" | "orderNumber">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  // Status update form
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  // Shipping settings form
  const [shippingCharge, setShippingCharge] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");

  // API hooks
  const { data, isLoading, error } = useAdminOrders(
    {
      page,
      limit: 20,
      status: statusFilter,
      search,
      sortBy,
      sortOrder,
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: shippingData } = useShippingSettings();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
  const { mutate: updateShipping, isPending: isUpdatingShipping } = useUpdateShippingSettings();

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const stats = orders.length > 0 ? calculateOrderStatistics(orders) : null;
  const formattedStats = stats ? formatOrderStatistics(stats) : null;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case OrderStatus.CONFIRMED:
      case OrderStatus.PROCESSING:
        return <Package className="w-5 h-5 text-blue-500" />;
      case OrderStatus.SHIPPED:
        return <Truck className="w-5 h-5 text-purple-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case OrderStatus.REFUNDED:
        return <RefreshCw className="w-5 h-5 text-orange-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;

    const request: UpdateOrderStatusRequest = {
      status: newStatus as OrderStatus,
      trackingNumber: trackingNumber || undefined,
      notes: statusNotes || undefined,
    };

    updateStatus(
      { orderId: selectedOrder.id, request },
      {
        onSuccess: () => {
          setShowStatusModal(false);
          setSelectedOrder(null);
          setNewStatus("");
          setTrackingNumber("");
          setStatusNotes("");
        },
      }
    );
  };

  const handleUpdateShipping = () => {
    const charge = parseFloat(shippingCharge);
    const threshold = parseFloat(freeShippingThreshold);

    if (isNaN(charge) || isNaN(threshold)) {
      alert("Please enter valid numbers");
      return;
    }

    updateShipping(
      {
        shippingCharge: charge,
        freeShippingThreshold: threshold,
      },
      {
        onSuccess: () => {
          setShowShippingModal(false);
        },
      }
    );
  };

  const openStatusModal = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setNewStatus("");
    setTrackingNumber("");
    setStatusNotes("");
    setShowStatusModal(true);
  };

  const openShippingModal = () => {
    if (shippingData?.data) {
      setShippingCharge(shippingData.data.shippingCharge);
      setFreeShippingThreshold(shippingData.data.freeShippingThreshold);
    }
    setShowShippingModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Order Management</h2>
            <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>
          <button
            onClick={openShippingModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Shipping Settings
          </button>
        </div>

        {/* Statistics */}
        {formattedStats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formattedStats.totalOrders}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{formattedStats.totalRevenue}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{formattedStats.pendingOrders}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Truck className="w-5 h-5" />
                <span className="text-sm font-medium">Shipped</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{formattedStats.shippedOrders}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.CONFIRMED}>Confirmed</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
            <option value={OrderStatus.REFUNDED}>Refunded</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="totalAmount">Sort by Amount</option>
            <option value="orderNumber">Sort by Order Number</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Orders</h2>
          <p className="text-red-700">{error.message}</p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !error && orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
          <p className="text-gray-600">No orders match your current filters.</p>
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{order.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.firstName} {order.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {order.items.slice(0, 3).map((item, idx) => {
                            const product = item.bicycle || item.part;
                            const imageUrl = product?.images?.[0]?.cloudinaryUrl;
                            return imageUrl ? (
                              <div
                                key={idx}
                                className="relative w-8 h-8 bg-gray-100 rounded overflow-hidden"
                              >
                                <Image src={imageUrl} alt="Product" fill className="object-cover" />
                              </div>
                            ) : null;
                          })}
                          <span className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {order.summary.formatted.total}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {formatOrderStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {formatPaymentStatus(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStatusModal(order)}
                            className="text-green-600 hover:text-green-900"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
                  total orders)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Update Order Status</h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">Order: {selectedOrder.orderNumber}</p>
              <p className="text-sm text-gray-600">
                Current Status:{" "}
                <span className={`font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                  {formatOrderStatus(selectedOrder.status)}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUpdatingStatus}
                >
                  <option value="">Select status...</option>
                  {getAvailableStatusTransitions(selectedOrder.status).map((status) => (
                    <option key={status} value={status}>
                      {formatOrderStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              {(newStatus === OrderStatus.SHIPPED || newStatus === OrderStatus.DELIVERED) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., TRACK123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdatingStatus}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isUpdatingStatus}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
                disabled={isUpdatingStatus}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || isUpdatingStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Shipping Settings Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Shipping Settings</h3>
                <p className="text-sm text-gray-600">Configure shipping costs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Charge (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={shippingCharge}
                  onChange={(e) => setShippingCharge(e.target.value)}
                  placeholder="e.g., 7.50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUpdatingShipping}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free Shipping Threshold (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  placeholder="e.g., 75.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUpdatingShipping}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orders above this amount will have free shipping
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShippingModal(false)}
                disabled={isUpdatingShipping}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateShipping}
                disabled={isUpdatingShipping}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingShipping ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
