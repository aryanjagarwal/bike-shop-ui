"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  billingDetails: {
    name: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    };
  };
}

const PaymentForm = ({
  clientSecret,
  paymentIntentId,
  amount,
  onSuccess,
  onError,
  billingDetails,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Prevent navigation during payment processing
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue =
          "Your payment is being processed. Are you sure you want to leave?";
        return "Your payment is being processed. Are you sure you want to leave?";
      }
    },
    [isProcessing]
  );

  // Block browser navigation during payment
  useEffect(() => {
    if (isProcessing) {
      window.addEventListener("beforeunload", handleBeforeUnload);

      const handlePopState = (e: PopStateEvent) => {
        if (isProcessing) {
          window.history.pushState(null, "", window.location.href);
          alert("Please wait while your payment is being processed.");
        }
      };

      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isProcessing, handleBeforeUnload]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError("Card element not found");
      setIsProcessing(false);
      return;
    }

    console.log("Confirming payment with Stripe...");

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      }
    );

    if (error) {
      setIsProcessing(false);
      console.error("Payment error:", error);
      setCardError(error.message || "Payment failed");
      onError(error.message || "Payment failed");
      return;
    }

    if (paymentIntent) {
      switch (paymentIntent.status) {
        case "succeeded":
          console.log("Payment succeeded!");
          setIsProcessing(false);
          onSuccess(paymentIntentId);
          break;
        case "processing":
          console.log("Payment is processing...");
          // Poll for payment status
          let pollCount = 0;
          const maxPollAttempts = 30;

          const pollPaymentStatus = async () => {
            pollCount++;

            if (pollCount > maxPollAttempts) {
              setIsProcessing(false);
              onError(
                "Payment verification timeout. Please check your account or contact support."
              );
              return;
            }

            try {
              const { paymentIntent: updatedIntent } =
                await stripe.retrievePaymentIntent(clientSecret);
              if (updatedIntent?.status === "succeeded") {
                setIsProcessing(false);
                onSuccess(paymentIntentId);
              } else if (updatedIntent?.status === "canceled") {
                setIsProcessing(false);
                onError("Payment was canceled");
              } else if (updatedIntent?.status === "processing") {
                setTimeout(pollPaymentStatus, 2000);
              } else {
                setIsProcessing(false);
                onError("Payment status unknown");
              }
            } catch (pollError) {
              console.error("Error polling payment status:", pollError);
              setIsProcessing(false);
              onError("Unable to verify payment status");
            }
          };
          setTimeout(pollPaymentStatus, 2000);
          break;
        case "requires_action":
          setIsProcessing(false);
          onError("Payment requires additional authentication");
          break;
        case "canceled":
          setIsProcessing(false);
          onError("Payment was canceled");
          break;
        default:
          setIsProcessing(false);
          onError("Payment failed or status unknown");
      }
    } else {
      setIsProcessing(false);
      onError("Payment failed - no payment intent returned");
    }
  };

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please don't close or refresh this page
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <Lock className="h-4 w-4 inline mr-2" />
              <strong>Do not navigate away</strong> - Your payment is being processed
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Card Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <CardElement options={cardElementOptions} onChange={handleCardChange} />
          </div>

          {cardError && (
            <p className="text-sm text-red-600">{cardError}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex justify-between items-center text-lg font-semibold pt-4 border-t">
            <span>Total Amount:</span>
            <span className="text-blue-600">
              £{amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay £{amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
