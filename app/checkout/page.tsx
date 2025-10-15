"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, MapPin, Package, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/hooks/useCart";
import { getCheckoutData, clearCheckoutData, type CheckoutData } from "@/lib/utils/checkoutData";
import { useGetAllAddresses, type Address } from "@/lib/api/addresses";
import { useGetShippingSettings, calculateShippingCost } from "@/lib/api/shipping";
import { useCreateCODOrder, useCreatePaymentIntent, useConfirmStripeOrder, DeliveryType } from "@/lib/api/orders";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { items, count } = useCart();
  const { data: addressesData, isLoading: addressesLoading } = useGetAllAddresses();
  const { data: shippingSettingsData } = useGetShippingSettings();
  
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [checkoutData, setCheckoutDataState] = useState<CheckoutData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [paymentIntentData, setPaymentIntentData] = useState<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  } | null>(null);

  const createCODOrder = useCreateCODOrder();
  const createPaymentIntent = useCreatePaymentIntent();
  const confirmStripeOrder = useConfirmStripeOrder();

  // Load checkout data from sessionStorage
  useEffect(() => {
    const data = getCheckoutData();
    if (!data && !orderPlaced) {
      router.push("/cart");
      return;
    }
    setCheckoutDataState(data);
  }, [router, orderPlaced]);

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addressesData?.data && addressesData.data.length > 0 && !selectedAddress) {
      const defaultAddress = addressesData.data.find((addr) => addr.isDefault);
      const addressToSelect = defaultAddress || addressesData.data[0];
      setSelectedAddress(addressToSelect);
    }
  }, [addressesData, selectedAddress]);

  if (!isSignedIn) {
    router.push("/auth/login");
    return null;
  }

  if (!checkoutData && !orderPlaced) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = checkoutData?.subtotal || 0;
  const discount = checkoutData?.discount || 0;
  const shippingCost = calculateShippingCost(
    checkoutData?.total || 0,
    shippingSettingsData?.data
  );
  const total = (checkoutData?.total || 0) + shippingCost;

  // Handle Cash on Delivery
  const handleCashPayment = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    try {
      const orderData: any = {
        shippingAddressId: selectedAddress.id,
        billingAddressId: selectedAddress.id,
        deliveryType: DeliveryType.STANDARD,
      };

      if (checkoutData?.couponCode) {
        orderData.couponCode = checkoutData.couponCode;
      }

      console.log('Creating COD order:', orderData);
      await createCODOrder.mutateAsync(orderData);

      setOrderPlaced(true);
      clearCheckoutData();
    } catch (error: any) {
      console.error('COD order failed:', error);
      alert(`Failed to place order: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle Card Payment - Create Payment Intent
  const handleCardPayment = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    try {
      console.log('Creating payment intent...');
      
      const paymentIntentResponse = await createPaymentIntent.mutateAsync({
        shippingAddressId: selectedAddress.id,
        billingAddressId: selectedAddress.id,
        couponCode: checkoutData?.couponCode || undefined,
      });

      console.log('Payment intent created:', paymentIntentResponse);

      setPaymentIntentData({
        clientSecret: paymentIntentResponse.data.clientSecret,
        paymentIntentId: paymentIntentResponse.data.paymentIntentId,
        amount: paymentIntentResponse.data.breakdown.total,
      });

      setShowStripePayment(true);
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      alert(`Failed to setup payment: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle Stripe Payment Success
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedAddress) return;

    try {
      console.log('Confirming Stripe order...');
      setIsConfirmingOrder(true);

      const orderData: any = {
        paymentIntentId: paymentIntentId,
        shippingAddressId: selectedAddress.id,
        billingAddressId: selectedAddress.id,
        deliveryType: DeliveryType.STANDARD,
      };

      if (checkoutData?.couponCode) {
        orderData.couponCode = checkoutData.couponCode;
      }

      await confirmStripeOrder.mutateAsync(orderData);

      setOrderPlaced(true);
      clearCheckoutData();
      setShowStripePayment(false);
    } catch (error: any) {
      console.error('Order confirmation failed:', error);
      setIsConfirmingOrder(false);
      alert(`Failed to confirm order: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle Stripe Payment Error
  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
    setShowStripePayment(false);
    setPaymentIntentData(null);
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and will be
            shipped soon.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Stripe Payment Modal
  if (showStripePayment && paymentIntentData) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gray-50">
        {/* Order Confirmation Loading Overlay */}
        {isConfirmingOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4"
            >
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
                <CheckCircle className="w-8 h-8 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Placing your order...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <Package className="h-4 w-4 inline mr-2" />
                Please wait while we confirm your order
              </div>
            </motion.div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setShowStripePayment(false)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
              disabled={isConfirmingOrder}
            >
              ← Back to Checkout
            </button>
          </div>

          <StripePaymentForm
            clientSecret={paymentIntentData.clientSecret}
            paymentIntentId={paymentIntentData.paymentIntentId}
            amount={paymentIntentData.amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            billingDetails={{
              name: user?.fullName || "",
              email: user?.primaryEmailAddress?.emailAddress || "",
              address: {
                line1: selectedAddress?.addressLine1 || "",
                line2: selectedAddress?.addressLine2 || undefined,
                city: selectedAddress?.city || "",
                state: selectedAddress?.county || undefined,
                postal_code: selectedAddress?.postalCode || "",
                country: "GB",
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps - Only 2 steps now */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <div className="px-4 text-sm font-medium">Shipping</div>
            <div
              className={`w-24 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}
            />
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              2
            </div>
            <div className="px-4 text-sm font-medium">Payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>

                {addressesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : addressesData?.data && addressesData.data.length > 0 ? (
                  <div className="space-y-4">
                    {addressesData.data.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddress(address)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddress?.id === address.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{address.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.county && `${address.county}, `}
                              {address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                          </div>
                          {address.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No saved addresses found</p>
                    <button
                      onClick={() => router.push("/addresses")}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Add Address
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress}
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>

                {/* Selected Address Summary */}
                {selectedAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Shipping To:</h3>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.title}<br />
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}<br />
                      {selectedAddress.city}, {selectedAddress.county && `${selectedAddress.county}, `}
                      {selectedAddress.postalCode}
                    </p>
                  </div>
                )}

                {/* Payment Method Options */}
                <div className="space-y-4 mb-6">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cod' && (
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Pay by Card */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'card' && (
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Pay by Card</h3>
                        <p className="text-sm text-gray-600">Secure payment with Stripe</p>
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {items.slice(0, 3).map((item) => {
                      const productName = item.bicycle?.name || item.part?.name || 'Product';
                      const productImage = item.bicycle?.images?.[0]?.cloudinaryUrl || '/placeholder.png';
                      
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={productImage}
                              alt={productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{productName}</h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-blue-600">
                              {item.priceBreakdown.formatted.grossPrice}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <p className="text-sm text-gray-500">+{items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={paymentMethod === 'cod' ? handleCashPayment : handleCardPayment}
                    disabled={createCODOrder.isPending || createPaymentIntent.isPending}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {(createCODOrder.isPending || createPaymentIntent.isPending) ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">£{subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {discount > 0 && checkoutData?.couponCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({checkoutData.couponCode})</span>
                    <span>-£{discount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? 'FREE' : `£${shippingCost.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-blue-600">
                    £{total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
