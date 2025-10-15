# 🚴 Shop Bicycles API Integration

Complete API integration for the bicycles shop page with filters, pagination, and sorting.

## 📁 Files Created/Updated

### **Updated Files**
- ✅ `lib/api/bicycles.ts` - Added 4 new API endpoints and hooks
- ✅ `app/shop/bicycles/page-new.tsx` - Complete shop page with backend integration

### **New API Endpoints**

1. **Get All Bicycles** (with filters & pagination)
   ```typescript
   GET /api/bicycles?page=1&limit=10&category=ROAD&minPrice=500&maxPrice=2000
   ```

2. **Get Bicycles by Category**
   ```typescript
   GET /api/bicycles/category/ROAD?limit=10
   ```

3. **Get Bicycle by ID**
   ```typescript
   GET /api/bicycles/:id
   ```

4. **Get Similar Bicycles**
   ```typescript
   GET /api/bicycles/:id/similar?limit=6
   ```

## 🎯 API Hooks Available

### 1. **useAllBicycles** - Get all bicycles with filters
```typescript
import { useAllBicycles } from '@/lib/api/bicycles';
import { BicycleCategory } from '@/lib/types/allTypes';

const { data, isLoading, error } = useAllBicycles({
  page: 1,
  limit: 12,
  category: BicycleCategory.ROAD,
  brand: 'Specialized',
  minPrice: 500,
  maxPrice: 2000,
  sortBy: 'price',
  sortOrder: 'asc',
});

// Response structure
const bicycles = data?.data; // Bicycle[]
const pagination = data?.pagination; // { page, limit, total, totalPages, hasNext, hasPrev }
```

### 2. **useBicyclesByCategory** - Get bicycles by category
```typescript
import { useBicyclesByCategory } from '@/lib/api/bicycles';
import { BicycleCategory } from '@/lib/types/allTypes';

const { data, isLoading } = useBicyclesByCategory(
  BicycleCategory.MOUNTAIN,
  10 // limit
);

const bicycles = data?.data;
```

### 3. **useBicycle** - Get single bicycle with details
```typescript
import { useBicycle } from '@/lib/api/bicycles';

const { data, isLoading } = useBicycle('bicycle-id');

const bicycle = data?.data;
// Includes: images, specifications, reviews, _count, averageRating
```

### 4. **useSimilarBicycles** - Get similar bicycles
```typescript
import { useSimilarBicycles } from '@/lib/api/bicycles';

const { data, isLoading } = useSimilarBicycles('bicycle-id', 6);

const similarBicycles = data?.data;
```

### 5. **useFeaturedBicycles** - Get featured bicycles (already existed)
```typescript
import { useFeaturedBicycles } from '@/lib/api/bicycles';

const { data, isLoading } = useFeaturedBicycles(8);

const featuredBicycles = data?.data;
```

## 🔧 Filter Parameters

### GetAllBicyclesParams
```typescript
interface GetAllBicyclesParams {
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 10)
  category?: BicycleCategory; // Filter by category
  minPrice?: number;          // Minimum price
  maxPrice?: number;          // Maximum price
  brand?: string;             // Filter by brand
  search?: string;            // Search query
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### Available Categories
```typescript
enum BicycleCategory {
  ROAD = 'ROAD',
  MOUNTAIN = 'MOUNTAIN',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
  KIDS = 'KIDS',
  BMX = 'BMX',
  FOLDING = 'FOLDING',
}
```

## 📊 Response Types

### Paginated Response
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Bicycle with Details
```typescript
interface BicycleWithDetails extends Bicycle {
  specifications?: any[];
  reviews?: any[];
  _count?: {
    reviews: number;
    wishlists: number;
  };
  averageRating?: number;
}
```

## 🎨 Shop Page Features

The new shop page (`page-new.tsx`) includes:

### **Filters**
- ✅ Category filter (radio buttons)
- ✅ Brand filter (radio buttons)
- ✅ Price range slider (£0 - £5000)
- ✅ Clear filters button

### **Sorting**
- ✅ Newest First
- ✅ Price: Low to High
- ✅ Price: High to Low
- ✅ Name: A to Z
- ✅ Name: Z to A

### **Pagination**
- ✅ Previous/Next buttons
- ✅ Page numbers with ellipsis
- ✅ Current page highlight
- ✅ Disabled state for first/last page

### **States**
- ✅ Loading state (skeleton loaders)
- ✅ Error state
- ✅ Empty state
- ✅ Success state with products

### **Responsive Design**
- ✅ Desktop filters sidebar (sticky)
- ✅ Mobile filters modal
- ✅ Responsive grid (1/2/3 columns)

## 📱 Usage Examples

### Basic Usage
```typescript
'use client';

import { useAllBicycles } from '@/lib/api/bicycles';
import BicycleCard from '@/components/BicycleCard';

export default function ShopPage() {
  const { data, isLoading } = useAllBicycles({ page: 1, limit: 12 });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {data?.data.map(bicycle => (
        <BicycleCard key={bicycle.id} bicycle={bicycle} />
      ))}
    </div>
  );
}
```

### With Filters
```typescript
const [category, setCategory] = useState<BicycleCategory>();
const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

const { data } = useAllBicycles({
  page: 1,
  limit: 12,
  category,
  minPrice: priceRange[0],
  maxPrice: priceRange[1],
  sortBy: 'price',
  sortOrder: 'asc',
});
```

### With Pagination
```typescript
const [page, setPage] = useState(1);

const { data } = useAllBicycles({ page, limit: 12 });

const pagination = data?.pagination;

// Next page
<button 
  onClick={() => setPage(page + 1)}
  disabled={!pagination?.hasNext}
>
  Next
</button>
```

## 🔄 Data Flow

```
User applies filter
    ↓
State updates (category, price, etc.)
    ↓
useAllBicycles hook called with new params
    ↓
GET /api/bicycles?category=ROAD&minPrice=500
    ↓
Backend returns filtered & paginated results
    ↓
Data cached for 5 minutes
    ↓
BicycleCard components rendered
```

## ✨ Key Features

✅ **Auto-fetching** - Fetches on mount and when filters change  
✅ **Caching** - 5-minute cache with TanStack Query  
✅ **Loading States** - Skeleton loaders  
✅ **Error Handling** - Graceful error messages  
✅ **Pagination** - Full pagination with page numbers  
✅ **Filters** - Category, brand, price range  
✅ **Sorting** - Multiple sort options  
✅ **Responsive** - Mobile and desktop layouts  
✅ **Type Safe** - Full TypeScript support  
✅ **Token Auth** - Automatic token injection  

## 🚀 Next Steps

To use the new shop page:

1. **Replace the old page:**
   ```bash
   rm app/shop/bicycles/page.tsx
   mv app/shop/bicycles/page-new.tsx app/shop/bicycles/page.tsx
   ```

2. **Ensure backend is running:**
   ```bash
   # Backend should be running on http://localhost:3001
   ```

3. **Ensure token is available:**
   - User must be signed in via Clerk
   - Token automatically exchanged via `useClerkSync`

4. **Test the page:**
   - Navigate to `/shop/bicycles`
   - Try filters, sorting, pagination
   - Check loading and error states

## 📝 API Response Examples

### Get All Bicycles Response
```json
{
  "success": true,
  "data": [
    {
      "id": "cmgnbvjj30000v604b2zhl7lg",
      "name": "Road Bike Pro 2024",
      "brand": "Specialized",
      "category": "ROAD",
      "price": "1150",
      "stockQuantity": 25,
      "images": [...],
      "_count": { "reviews": 0 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get Bicycle by ID Response
```json
{
  "success": true,
  "data": {
    "id": "cmgnbvjj30000v604b2zhl7lg",
    "name": "Road Bike Pro 2024",
    "images": [
      {
        "id": "cmgnd2smc0001v66ke98kg80s",
        "cloudinaryUrl": "https://...",
        "isPrimary": true
      }
    ],
    "specifications": [],
    "reviews": [],
    "_count": {
      "reviews": 0,
      "wishlists": 1
    },
    "averageRating": 0
  }
}
```

## 🎉 Summary

All bicycle shop APIs are now integrated with:
- ✅ 5 TanStack Query hooks
- ✅ Complete shop page with filters
- ✅ Pagination support
- ✅ Loading/error/empty states
- ✅ Responsive design
- ✅ Type-safe API calls
- ✅ Automatic token authentication

The shop page is production-ready! 🚴‍♂️
