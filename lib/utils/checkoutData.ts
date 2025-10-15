// Checkout data utilities for passing cart information to checkout page

export interface CheckoutData {
  subtotal: number; // Original cart total (in pounds)
  discount: number; // Discount amount (in pounds)
  couponCode: string | null; // Applied coupon code
  couponId: string | null; // Applied coupon ID
  shipping: number; // Shipping cost (in pounds)
  total: number; // Final total after discount (in pounds)
}

/**
 * Store checkout data in sessionStorage
 */
export const setCheckoutData = (data: CheckoutData): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('checkoutData', JSON.stringify(data));
  }
};

/**
 * Retrieve checkout data from sessionStorage
 */
export const getCheckoutData = (): CheckoutData | null => {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem('checkoutData');
    if (data) {
      try {
        return JSON.parse(data) as CheckoutData;
      } catch (error) {
        console.error('Failed to parse checkout data:', error);
        return null;
      }
    }
  }
  return null;
};

/**
 * Clear checkout data from sessionStorage
 */
export const clearCheckoutData = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('checkoutData');
  }
};

/**
 * Calculate total with shipping
 */
export const calculateTotalWithShipping = (data: CheckoutData): number => {
  return data.total + data.shipping;
};

/**
 * Format checkout data for display
 */
export const formatCheckoutData = (data: CheckoutData) => {
  return {
    subtotal: `£${data.subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    discount: data.discount > 0 
      ? `-£${data.discount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : '£0.00',
    shipping: `£${data.shipping.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    total: `£${data.total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    finalTotal: `£${calculateTotalWithShipping(data).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };
};
