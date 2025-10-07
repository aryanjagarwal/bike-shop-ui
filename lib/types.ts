export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: "bicycle" | "parts";
  subCategory: string;
  brand: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured?: boolean;
  specifications?: Record<string, string>;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  addresses?: Address[];
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  date: string;
  trackingNumber?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}
