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
  AlertCircle,
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  Mail,
  Ban
} from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  useOrderById,
  getOrderStatusColor,
  formatOrderStatus,
  getPaymentStatusColor,
  formatPaymentStatus,
  useCancelOrder,
  canCancelOrder
} from "@/lib/api/orders";
import { OrderStatus } from "@/lib/types/allTypes";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isSignedIn } = useAuth();
  const orderId = params.orderId as string;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const { data, isLoading, error, refetch } = useOrderById(orderId, {
    enabled: isSignedIn && !!orderId,
  });

  const handleCancelOrder = () => {
    cancelOrder(
      { orderId, request: { reason: cancelReason || undefined } },
      {
        onSuccess: () => {
          setShowCancelModal(false);
          setCancelReason('');
        },
      }
    );
  };

  if (!isSignedIn) {
    router.push("/auth/login");
    return null;
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'REFUNDED':
        return <RefreshCw className="w-6 h-6 text-orange-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Order</h2>
            <p className="text-red-700 mb-4">{error.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/orders')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Orders
              </button>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  const order = data.data;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{order.orderNumber}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-2 ${getOrderStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {formatOrderStatus(order.status)}
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-3">
                {order.summary.formatted.total}
              </p>
              {canCancelOrder(order) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 ml-auto"
                >
                  <Ban className="w-4 h-4" />
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Created:</span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              {order.shippedAt && (
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Shipped:</span>
                  <span className="font-semibold">
                    {new Date(order.shippedAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Delivered:</span>
                  <span className="font-semibold">
                    {new Date(order.deliveredAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = item.bicycle || item.part;
                  const productImage = product?.images?.[0]?.cloudinaryUrl || '/placeholder-bike.jpg';
                  const productName = item.bicycle?.name || item.part?.name || 'Product';
                  const productBrand = item.bicycle?.brand || '';
                  const productModel = item.bicycle?.model || item.part?.sku || '';
                  
                  return (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{productName}</h3>
                        {productBrand && (
                          <p className="text-sm text-gray-600">
                            {productBrand} {productModel && `- ${productModel}`}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Qty: <span className="font-semibold">{item.quantity}</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Unit Price: <span className="font-semibold">£{parseFloat(item.unitPrice).toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          £{parseFloat(item.totalPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {formatPaymentStatus(order.paymentStatus)}
                  </span>
                </div>
                {order.paymentIntentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-sm">{order.paymentIntentId}</span>
                  </div>
                )}
                {order.payments && order.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Payment Details</h3>
                    {order.payments.map((payment: any) => (
                      <div key={payment.id} className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span className="font-semibold">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold">£{parseFloat(payment.amount).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Applied Coupons */}
            {order.coupons && order.coupons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4">Applied Coupons</h2>
                <div className="space-y-3">
                  {order.coupons.map((coupon) => (
                    <div key={coupon.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-green-900">{coupon.coupon.code}</p>
                          <p className="text-sm text-green-700">{coupon.coupon.name}</p>
                          {coupon.coupon.description && (
                            <p className="text-sm text-green-600 mt-1">{coupon.coupon.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-900">
                            -£{parseFloat(coupon.discountAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {order.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4">Order Notes</h2>
                <p className="text-gray-700">{order.notes}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{order.summary.formatted.subtotal}</span>
                </div>
                
                {order.summary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-{order.summary.formatted.discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Amount:</span>
                  <span className="font-semibold">{order.summary.formatted.netAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (20%):</span>
                  <span className="font-semibold">{order.summary.formatted.vatAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">{order.summary.formatted.shippingCost}</span>
                </div>
                
                <div className="pt-3 border-t flex justify-between">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">{order.summary.formatted.total}</span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="font-semibold">{order.shippingAddress.title}</p>
                <p className="text-gray-700">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-gray-700">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.county && (
                  <p className="text-gray-700">{order.shippingAddress.county}</p>
                )}
                <p className="text-gray-700">{order.shippingAddress.country}</p>
              </div>
            </motion.div>

            {/* Billing Address */}
            {order.billingAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing Address
                </h2>
                <div className="space-y-2">
                  <p className="font-semibold">{order.billingAddress.title}</p>
                  <p className="text-gray-700">{order.billingAddress.addressLine1}</p>
                  {order.billingAddress.addressLine2 && (
                    <p className="text-gray-700">{order.billingAddress.addressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {order.billingAddress.city}, {order.billingAddress.postalCode}
                  </p>
                  {order.billingAddress.county && (
                    <p className="text-gray-700">{order.billingAddress.county}</p>
                  )}
                  <p className="text-gray-700">{order.billingAddress.country}</p>
                </div>
              </motion.div>
            )}

            {/* Customer Information */}
            {order.user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {order.user.firstName} {order.user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{order.user.email}</span>
                  </div>
                  {order.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{order.user.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
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

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">Order: {order.orderNumber}</p>
              <p className="text-sm text-gray-600">Total: {order.summary.formatted.total}</p>
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
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
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
  );
}
