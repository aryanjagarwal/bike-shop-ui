"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, AlertCircle, Ban } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  useMyOrders, 
  GetMyOrdersRequest,
  getOrderStatusColor,
  formatOrderStatus,
  useCancelOrder,
  canCancelOrder
} from "@/lib/api/orders";
import { OrderStatus } from "@/lib/types/allTypes";

export default function OrdersPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  
  const [filters, setFilters] = useState<GetMyOrdersRequest>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const handleCancelOrder = (orderId: string) => {
    setCancellingOrderId(orderId);
    setCancelReason('');
  };

  const confirmCancelOrder = () => {
    if (!cancellingOrderId) return;
    
    cancelOrder(
      { orderId: cancellingOrderId, request: { reason: cancelReason || undefined } },
      {
        onSuccess: () => {
          setCancellingOrderId(null);
          setCancelReason('');
        },
      }
    );
  };

  const { data, isLoading, error, refetch } = useMyOrders(filters, {
    enabled: isSignedIn,
  });

  if (!isSignedIn) {
    router.push("/auth/login");
    return null;
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'REFUNDED':
        return <RefreshCw className="w-5 h-5 text-orange-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          {data?.pagination && (
            <p className="text-gray-600">
              Total: {data.pagination.total} orders
            </p>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as OrderStatus || undefined, page: 1 })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value as any })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="totalAmount">Sort by Amount</option>
              <option value="orderNumber">Sort by Order Number</option>
            </select>

            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) =>
                setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
              }
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
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Orders</h2>
            <p className="text-red-700 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">
              You haven&apos;t placed any orders yet.
            </p>
            <button
              onClick={() => router.push("/shop/bicycles")}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : !isLoading && !error && data?.data ? (
          <div className="space-y-6">
            {data.data.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {formatOrderStatus(order.status)}
                    </span>
                    <span className="font-bold text-xl text-blue-600">
                      {order.summary.formatted.total}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {order.items.map((item) => {
                    const product = item.bicycle || item.part;
                    const productImage = product?.images?.[0]?.cloudinaryUrl || '/placeholder-bike.jpg';
                    const productName = item.bicycle?.name || item.part?.name || 'Product';
                    
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{productName}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Unit Price: £{parseFloat(item.unitPrice).toFixed(2)}
                          </p>
                          <p className="font-bold text-blue-600">
                            £{parseFloat(item.totalPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Subtotal:</div>
                    <div className="text-right font-semibold">{order.summary.formatted.subtotal}</div>
                    
                    {order.summary.discount > 0 && (
                      <>
                        <div className="text-gray-600">Discount:</div>
                        <div className="text-right font-semibold text-green-600">-{order.summary.formatted.discount}</div>
                      </>
                    )}
                    
                    <div className="text-gray-600">VAT:</div>
                    <div className="text-right font-semibold">{order.summary.formatted.vatAmount}</div>
                    
                    <div className="text-gray-600">Shipping:</div>
                    <div className="text-right font-semibold">{order.summary.formatted.shippingCost}</div>
                  </div>
                </div>

                {order.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Notes:</span> {order.notes}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mt-4 flex gap-3">
                  <button 
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Write Review
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={!data.pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={!data.pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Cancel Order Modal */}
        {cancellingOrderId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Cancel Order</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to cancel this order?</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Changed my mind, Found a better deal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isCancelling}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancellingOrderId(null);
                    setCancelReason('');
                  }}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
