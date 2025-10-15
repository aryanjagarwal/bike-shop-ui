// ============================================
// ENUMS
// ============================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
}

export enum BicycleCategory {
  ROAD = 'ROAD',
  MOUNTAIN = 'MOUNTAIN',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
  KIDS = 'KIDS',
  BMX = 'BMX',
  FOLDING = 'FOLDING',
}

export enum InstallationLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum InventoryTransaction {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  DAMAGE = 'DAMAGE',
  TRANSFER = 'TRANSFER',
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  SERVICE_REMINDER = 'SERVICE_REMINDER',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
}

// ============================================
// USER MANAGEMENT
// ============================================

export interface User {
  id: string;
  clerkUid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  profile?: Profile;
  addresses?: Address[];
  customerBikes?: CustomerBike[];
  carts?: Cart[];
  orders?: Order[];
  serviceBookings?: ServiceBooking[];
  reviews?: Review[];
  wishlists?: Wishlist[];
  notifications?: Notification[];
}

export interface Profile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  preferences: string | null; // JSON string
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  user?: User;
}

// ============================================
// ADDRESS MANAGEMENT
// ============================================

export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  title: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  county: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  user?: User;
  shippingOrders?: Order[];
  billingOrders?: Order[];
}

// ============================================
// BICYCLE MANAGEMENT
// ============================================

export interface Bicycle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  category: BicycleCategory;
  frameSize: string;
  frameMaterial: string;
  color: string;
  description: string | null;
  price: string; // Decimal as string
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  weight: string | null;
  warrantyPeriod: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  images?: BicycleImage[];
  specifications?: BicycleSpecification[];
  partCompatibility?: PartBicycleCompatibility[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  customerBikes?: CustomerBike[];
  reviews?: Review[];
  wishlists?: Wishlist[];
  inventoryLogs?: InventoryLog[];
}

export interface BicycleImage {
  id: string;
  bicycleId: string;
  cloudinaryUrl: string;
  publicId: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  
  // Relations (optional)
  bicycle?: Bicycle;
}

export interface BicycleSpecification {
  id: string;
  bicycleId: string;
  specName: string;
  specValue: string;
  specCategory: string | null;
  createdAt: string;
  
  // Relations (optional)
  bicycle?: Bicycle;
}

// ============================================
// PARTS MANAGEMENT
// ============================================

export interface PartCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentCategoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  parentCategory?: PartCategory;
  childCategories?: PartCategory[];
  parts?: Part[];
}

export interface Part {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  partCategoryId: string;
  description: string | null;
  price: string; // Decimal as string
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  weight: string | null;
  warrantyPeriod: string | null;
  installationDifficulty: InstallationLevel;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  category?: PartCategory;
  images?: PartImage[];
  specifications?: PartSpecification[];
  bicycleCompatibility?: PartBicycleCompatibility[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  reviews?: Review[];
  wishlists?: Wishlist[];
  inventoryLogs?: InventoryLog[];
}

export interface PartImage {
  id: string;
  partId: string;
  cloudinaryUrl: string;
  publicId: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  
  // Relations (optional)
  part?: Part;
}

export interface PartSpecification {
  id: string;
  partId: string;
  specName: string;
  specValue: string;
  specCategory: string | null;
  createdAt: string;
  
  // Relations (optional)
  part?: Part;
}

// ============================================
// PART-BICYCLE COMPATIBILITY
// ============================================

export interface PartBicycleCompatibility {
  id: string;
  partId: string;
  bicycleId: string;
  isCompatible: boolean;
  compatibilityNotes: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  part?: Part;
  bicycle?: Bicycle;
}

// ============================================
// SERVICE MANAGEMENT
// ============================================

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  services?: Service[];
}

export interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  description: string | null;
  basePrice: string; // Decimal as string
  estimatedDurationMinutes: number;
  isActive: boolean;
  requiresDiagnosis: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  category?: ServiceCategory;
  serviceBookings?: ServiceBooking[];
}

export interface ServiceBooking {
  id: string;
  userId: string;
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  status: BookingStatus;
  customerNotes: string | null;
  technicianNotes: string | null;
  customerBikeDetails: string | null;
  quotedPrice: string | null; // Decimal as string
  finalPrice: string | null; // Decimal as string
  paymentStatus: PaymentStatus;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  
  // Relations (optional)
  user?: User;
  service?: Service;
  images?: ServiceBookingImage[];
  technician?: ServiceBookingTechnician;
  payments?: Payment[];
  reviews?: Review[];
}

export interface ServiceBookingImage {
  id: string;
  serviceBookingId: string;
  cloudinaryUrl: string;
  publicId: string;
  description: string | null;
  createdAt: string;
  
  // Relations (optional)
  serviceBooking?: ServiceBooking;
}

// ============================================
// TECHNICIAN MANAGEMENT
// ============================================

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specializations: string | null; // JSON string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  serviceBookings?: ServiceBookingTechnician[];
}

export interface ServiceBookingTechnician {
  id: string;
  serviceBookingId: string;
  technicianId: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  
  // Relations (optional)
  serviceBooking?: ServiceBooking;
  technician?: Technician;
}

// ============================================
// CUSTOMER BIKE MANAGEMENT
// ============================================

export interface CustomerBike {
  id: string;
  userId: string;
  bicycleId: string;
  customName: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  customModifications: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  user?: User;
  bicycle?: Bicycle;
}

// ============================================
// E-COMMERCE MANAGEMENT
// ============================================

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  user?: User;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  bicycleId: string | null;
  partId: string | null;
  quantity: number;
  unitPrice: string; // Decimal as string
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  cart?: Cart;
  bicycle?: Bicycle;
  part?: Part;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string; // Decimal as string
  taxAmount: string; // Decimal as string
  shippingCost: string; // Decimal as string
  totalAmount: string; // Decimal as string
  shippingAddressId: string | null;
  billingAddressId: string | null;
  paymentIntentId: string | null;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  
  // Relations (optional)
  user?: User;
  shippingAddress?: Address;
  billingAddress?: Address;
  items?: OrderItem[];
  payments?: Payment[];
  coupons?: OrderCoupon[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  bicycleId: string | null;
  partId: string | null;
  quantity: number;
  unitPrice: string; // Decimal as string
  totalPrice: string; // Decimal as string
  createdAt: string;
  
  // Relations (optional)
  order?: Order;
  bicycle?: Bicycle;
  part?: Part;
}

// ============================================
// PAYMENT MANAGEMENT
// ============================================

export interface Payment {
  id: string;
  orderId: string | null;
  serviceBookingId: string | null;
  stripePaymentIntentId: string;
  amount: string; // Decimal as string
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  order?: Order;
  serviceBooking?: ServiceBooking;
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

export interface InventoryLog {
  id: string;
  bicycleId: string | null;
  partId: string | null;
  transactionType: InventoryTransaction;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  referenceId: string | null;
  createdAt: string;
  
  // Relations (optional)
  bicycle?: Bicycle;
  part?: Part;
}

// ============================================
// REVIEWS AND RATINGS
// ============================================

export interface Review {
  id: string;
  userId: string;
  bicycleId: string | null;
  partId: string | null;
  serviceBookingId: string | null;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional)
  user?: User;
  bicycle?: Bicycle;
  part?: Part;
  serviceBooking?: ServiceBooking;
  images?: ReviewImage[];
}

export interface ReviewImage {
  id: string;
  reviewId: string;
  cloudinaryUrl: string;
  publicId: string;
  altText: string | null;
  createdAt: string;
  
  // Relations (optional)
  review?: Review;
}

// ============================================
// WISHLIST AND FAVORITES
// ============================================

export interface Wishlist {
  id: string;
  userId: string;
  bicycleId: string | null;
  partId: string | null;
  createdAt: string;
  
  // Relations (optional)
  user?: User;
  bicycle?: Bicycle;
  part?: Part;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
  
  // Relations (optional)
  user?: User;
}

// ============================================
// COUPONS AND DISCOUNTS
// ============================================

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: string; // Decimal as string
  minOrderAmount: string; // Decimal as string
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Relations (optional)
  orderCoupons?: OrderCoupon[];
}

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  issuedAt: string;
  isRedeemed: boolean;
  redeemedAt: string | null;
  
  // Relations (optional)
  coupon?: Coupon;
}

export interface OrderCoupon {
  id: string;
  orderId: string;
  couponId: string;
  discountAmount: string; // Decimal as string
  appliedAt: string;
  
  // Relations (optional)
  order?: Order;
  coupon?: Coupon;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev?: boolean;
    hasNext?: boolean;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'clerkUid' | 'createdAt' | 'updatedAt'>>;

export type CreateBicycleInput = Omit<Bicycle, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBicycleInput = Partial<Omit<Bicycle, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreatePartInput = Omit<Part, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePartInput = Partial<Omit<Part, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateOrderInput = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'shippedAt' | 'deliveredAt'>;
export type UpdateOrderInput = Partial<Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>>;

export type CreateServiceBookingInput = Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;
export type UpdateServiceBookingInput = Partial<Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt'>>;
