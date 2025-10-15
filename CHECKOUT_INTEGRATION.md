# Checkout Integration Guide

## Overview
The cart page now passes pricing data (with or without coupon) to the checkout page using sessionStorage.

## Data Structure

```typescript
interface CheckoutData {
  subtotal: number;      // Original cart total (in pounds)
  discount: number;      // Discount amount (in pounds, 0 if no coupon)
  couponCode: string | null;  // Applied coupon code or null
  couponId: string | null;    // Applied coupon ID or null
  shipping: number;      // Shipping cost (currently 0)
  total: number;         // Final total after discount
}
```

## How to Use in Checkout Page

### 1. Import the utility functions

```typescript
import { getCheckoutData, clearCheckoutData, formatCheckoutData } from "@/lib/utils/checkoutData";
```

### 2. Retrieve data in your checkout component

```typescript
"use client";

import { useEffect, useState } from "react";
import { getCheckoutData, clearCheckoutData, type CheckoutData } from "@/lib/utils/checkoutData";

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    // Get checkout data from sessionStorage
    const data = getCheckoutData();
    
    if (!data) {
      // Redirect to cart if no data
      router.push('/cart');
      return;
    }
    
    setCheckoutData(data);
  }, []);

  // Clear data when order is completed
  const handleOrderComplete = () => {
    clearCheckoutData();
    // ... rest of your order completion logic
  };

  if (!checkoutData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Checkout</h1>
      
      {/* Display pricing */}
      <div>
        <p>Subtotal: £{checkoutData.subtotal.toFixed(2)}</p>
        
        {checkoutData.discount > 0 && (
          <p>Discount ({checkoutData.couponCode}): -£{checkoutData.discount.toFixed(2)}</p>
        )}
        
        <p>Shipping: £{checkoutData.shipping.toFixed(2)}</p>
        <p>Total: £{checkoutData.total.toFixed(2)}</p>
      </div>
    </div>
  );
}
```

### 3. Using formatted data

```typescript
import { getCheckoutData, formatCheckoutData } from "@/lib/utils/checkoutData";

const data = getCheckoutData();
if (data) {
  const formatted = formatCheckoutData(data);
  
  console.log(formatted.subtotal);   // "£2,400.00"
  console.log(formatted.discount);   // "-£480.00" or "£0.00"
  console.log(formatted.total);      // "£1,920.00"
  console.log(formatted.finalTotal); // Total + shipping
}
```

## Example Scenarios

### Scenario 1: No Coupon Applied
```json
{
  "subtotal": 2400,
  "discount": 0,
  "couponCode": null,
  "couponId": null,
  "shipping": 0,
  "total": 2400
}
```

### Scenario 2: Coupon Applied (20% off)
```json
{
  "subtotal": 2400,
  "discount": 480,
  "couponCode": "SALE32",
  "couponId": "cmgpalhb1000aqj0i96geqjzv",
  "shipping": 0,
  "total": 1920
}
```

## Important Notes

1. **Data Persistence**: Data is stored in `sessionStorage`, so it persists across page navigation but is cleared when the browser tab is closed.

2. **Security**: The coupon validation happens on the backend. The checkout page should send the `couponId` to the backend for final verification during order creation.

3. **Clear Data**: Always call `clearCheckoutData()` after successful order completion to prevent data reuse.

4. **Validation**: The checkout page should validate that the data exists and redirect to cart if missing.

5. **All values are in pounds** (not pence), ready for display and API calls.

## Backend Integration

When creating an order, send the coupon information:

```typescript
const orderData = {
  items: [...],
  couponId: checkoutData.couponId, // Send this to backend
  // Backend will recalculate and validate the discount
};
```

The backend should:
- Validate the coupon is still valid
- Recalculate the discount
- Apply it to the order
- Store the coupon usage in `OrderCoupon` table
