# 📦 TypeScript Types

Complete TypeScript type definitions for the bicycle shop application, generated from the Prisma schema.

## 📁 Files

- **`allTypes.ts`** - All type definitions and enums
- **`index.ts`** - Central export file

## 🎯 What's Included

### Enums (9 total)
- `UserRole` - CUSTOMER, ADMIN, TECHNICIAN
- `BicycleCategory` - ROAD, MOUNTAIN, HYBRID, ELECTRIC, KIDS, BMX, FOLDING
- `InstallationLevel` - EASY, MEDIUM, ADVANCED, PROFESSIONAL
- `BookingStatus` - PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
- `OrderStatus` - PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
- `PaymentStatus` - PENDING, SUCCEEDED, FAILED, CANCELLED, REFUNDED
- `InventoryTransaction` - PURCHASE, SALE, RETURN, ADJUSTMENT, DAMAGE, TRANSFER
- `NotificationType` - ORDER_UPDATE, SERVICE_REMINDER, PROMOTION, SYSTEM, REVIEW_REQUEST
- `DiscountType` - PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
- `AddressType` - HOME, WORK, BILLING, SHIPPING

### Interfaces (30+ models)

#### User Management
- `User` - User account
- `Profile` - User profile details

#### Address Management
- `Address` - User addresses

#### Bicycle Management
- `Bicycle` - Bicycle products
- `BicycleImage` - Bicycle images (Cloudinary)
- `BicycleSpecification` - Bicycle specs

#### Parts Management
- `PartCategory` - Part categories (hierarchical)
- `Part` - Part products
- `PartImage` - Part images (Cloudinary)
- `PartSpecification` - Part specs
- `PartBicycleCompatibility` - Part-bicycle compatibility

#### Service Management
- `ServiceCategory` - Service categories
- `Service` - Services offered
- `ServiceBooking` - Service bookings
- `ServiceBookingImage` - Service booking images

#### Technician Management
- `Technician` - Technicians
- `ServiceBookingTechnician` - Technician assignments

#### Customer Bike Management
- `CustomerBike` - Customer-owned bikes

#### E-commerce
- `Cart` - Shopping carts
- `CartItem` - Cart items
- `Order` - Orders
- `OrderItem` - Order items

#### Payment
- `Payment` - Payment records (Stripe)

#### Inventory
- `InventoryLog` - Inventory transactions

#### Reviews
- `Review` - Product/service reviews
- `ReviewImage` - Review images

#### Wishlist
- `Wishlist` - User wishlists

#### Notifications
- `Notification` - User notifications

#### Coupons
- `Coupon` - Discount coupons
- `OrderCoupon` - Applied coupons

### Utility Types
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API response
- `CreateUserInput` - User creation input
- `UpdateUserInput` - User update input
- `CreateBicycleInput` - Bicycle creation input
- `UpdateBicycleInput` - Bicycle update input
- `CreatePartInput` - Part creation input
- `UpdatePartInput` - Part update input
- `CreateOrderInput` - Order creation input
- `UpdateOrderInput` - Order update input
- `CreateServiceBookingInput` - Service booking creation input
- `UpdateServiceBookingInput` - Service booking update input

## 📚 Usage Examples

### Import Types

```typescript
// Import specific types
import { User, Bicycle, Order, UserRole } from '@/lib/types';

// Import all types
import * as Types from '@/lib/types';
```

### Using Enums

```typescript
import { UserRole, BicycleCategory, OrderStatus } from '@/lib/types';

const userRole: UserRole = UserRole.ADMIN;
const category: BicycleCategory = BicycleCategory.ROAD;
const status: OrderStatus = OrderStatus.PENDING;
```

### Using Interfaces

```typescript
import { User, Bicycle, Order } from '@/lib/types';

const user: User = {
  id: '123',
  clerkUid: 'user_abc',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: null,
  role: UserRole.CUSTOMER,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const bicycle: Bicycle = {
  id: '456',
  name: 'Road Bike Pro',
  brand: 'Specialized',
  model: 'Allez Elite',
  year: '2024',
  category: BicycleCategory.ROAD,
  frameSize: '56cm',
  frameMaterial: 'Aluminum',
  color: 'Red',
  description: 'High-performance road bike',
  price: '1150.00',
  stockQuantity: 25,
  isActive: true,
  isFeatured: true,
  weight: '9.5kg',
  warrantyPeriod: '2 years',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  images: [],
};
```

### Using API Response Types

```typescript
import { ApiResponse, PaginatedResponse, Bicycle } from '@/lib/types';

// Single item response
const response: ApiResponse<Bicycle> = {
  success: true,
  data: bicycle,
};

// List response
const listResponse: ApiResponse<Bicycle[]> = {
  success: true,
  data: [bicycle1, bicycle2],
};

// Paginated response
const paginatedResponse: PaginatedResponse<Bicycle> = {
  success: true,
  data: [bicycle1, bicycle2],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
  },
};
```

### Using Utility Types

```typescript
import { CreateBicycleInput, UpdateBicycleInput } from '@/lib/types';

// Creating a new bicycle (no id, createdAt, updatedAt)
const newBicycle: CreateBicycleInput = {
  name: 'Mountain Bike Pro',
  brand: 'Trek',
  model: 'X-Caliber 9',
  year: '2024',
  category: BicycleCategory.MOUNTAIN,
  frameSize: '18"',
  frameMaterial: 'Carbon',
  color: 'Black',
  description: 'Professional mountain bike',
  price: '2500.00',
  stockQuantity: 10,
  isActive: true,
  isFeatured: false,
  weight: '12kg',
  warrantyPeriod: '3 years',
};

// Updating a bicycle (all fields optional except id)
const updateData: UpdateBicycleInput = {
  price: '2400.00',
  stockQuantity: 8,
  isFeatured: true,
};
```

### Type Guards

```typescript
import { User, UserRole } from '@/lib/types';

function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

function isTechnician(user: User): boolean {
  return user.role === UserRole.TECHNICIAN;
}
```

### Component Props

```typescript
import { Bicycle, Part, Order } from '@/lib/types';

interface BicycleCardProps {
  bicycle: Bicycle;
  onAddToCart?: (bicycle: Bicycle) => void;
}

interface OrderDetailsProps {
  order: Order;
  onCancel?: (orderId: string) => void;
}

interface PartListProps {
  parts: Part[];
  loading?: boolean;
}
```

## 🔄 Relationship Types

All interfaces include optional relation fields:

```typescript
import { Bicycle } from '@/lib/types';

// Bicycle with images loaded
const bicycleWithImages: Bicycle = {
  // ... bicycle fields
  images: [
    {
      id: '1',
      bicycleId: '456',
      cloudinaryUrl: 'https://...',
      publicId: 'bicycle-123',
      altText: 'Front view',
      isPrimary: true,
      sortOrder: 0,
      createdAt: '2025-01-01T00:00:00Z',
    }
  ],
};

// Bicycle with specifications
const bicycleWithSpecs: Bicycle = {
  // ... bicycle fields
  specifications: [
    {
      id: '1',
      bicycleId: '456',
      specName: 'Gear System',
      specValue: 'Shimano 105',
      specCategory: 'Drivetrain',
      createdAt: '2025-01-01T00:00:00Z',
    }
  ],
};
```

## 💡 Best Practices

1. **Always import from the types directory:**
   ```typescript
   import { User, Bicycle } from '@/lib/types';
   ```

2. **Use enums for type safety:**
   ```typescript
   // ✅ Good
   user.role = UserRole.ADMIN;
   
   // ❌ Bad
   user.role = 'ADMIN';
   ```

3. **Use utility types for API inputs:**
   ```typescript
   // ✅ Good
   const createData: CreateBicycleInput = { ... };
   
   // ❌ Bad
   const createData: Bicycle = { id: '', createdAt: '', ... };
   ```

4. **Type your API responses:**
   ```typescript
   async function getBicycle(id: string): Promise<ApiResponse<Bicycle>> {
     return apiClient.get(`/api/bicycles/${id}`);
   }
   ```

5. **Use optional relations carefully:**
   ```typescript
   // Check if relation is loaded
   if (bicycle.images && bicycle.images.length > 0) {
     const primaryImage = bicycle.images.find(img => img.isPrimary);
   }
   ```

## 🎨 Type Aliases

Create custom type aliases for common patterns:

```typescript
import { Bicycle, BicycleImage } from '@/lib/types';

// Bicycle with required images
export type BicycleWithImages = Bicycle & {
  images: BicycleImage[];
};

// Featured bicycle
export type FeaturedBicycle = Bicycle & {
  isFeatured: true;
};
```

## 🔧 Extending Types

You can extend types for specific use cases:

```typescript
import { Bicycle } from '@/lib/types';

// Add computed fields
export interface BicycleWithComputedFields extends Bicycle {
  formattedPrice: string;
  inStock: boolean;
  primaryImageUrl: string;
}

// Add UI state
export interface BicycleCardState extends Bicycle {
  isHovered: boolean;
  isInCart: boolean;
  isInWishlist: boolean;
}
```

## ✅ Type Safety Benefits

- ✅ **Autocomplete** - IntelliSense in VS Code
- ✅ **Type Checking** - Catch errors at compile time
- ✅ **Refactoring** - Safe renaming and restructuring
- ✅ **Documentation** - Self-documenting code
- ✅ **Consistency** - Same types across frontend and backend

## 🚀 Next Steps

1. Use these types in all API calls
2. Type your component props
3. Type your state management
4. Type your form inputs
5. Type your API responses

All types are synced with your Prisma schema! 🎉
