# Parts API Documentation

This document describes the Parts API implementation using TanStack Query.

## 📁 File Location
`/lib/api/parts.ts`

## 🎯 Features

### API Functions (Direct API Calls)
1. **`getAllParts(params)`** - Get all parts with filters and pagination
2. **`getPartById(id)`** - Get single part by ID with full details
3. **`getFeaturedParts(params)`** - Get featured parts
4. **`getAllPartCategories()`** - Get all part categories
5. **`getPartCategoryById(id)`** - Get category by ID with child categories
6. **`getPartsByCategory(categoryId, params)`** - Get parts by category ID
7. **`getPartCategories()`** - Alternative endpoint for part categories
8. **`getCompatiblePartsByBicycleId(bicycleId)`** - Get compatible parts for a bicycle
9. **`getCompatibleBicyclesByPartId(partId)`** - Get compatible bicycles for a part

### TanStack Query Hooks (React Hooks)
1. **`useAllParts(params)`** - Fetch all parts with filters
2. **`usePart(id)`** - Fetch single part by ID
3. **`useFeaturedParts(limit)`** - Fetch featured parts
4. **`usePartCategories()`** - Fetch all part categories
5. **`usePartCategory(id)`** - Fetch category by ID
6. **`usePartsByCategory(categoryId, limit)`** - Fetch parts by category
7. **`useCompatibleParts(bicycleId)`** - Fetch compatible parts for bicycle
8. **`useCompatibleBicycles(partId)`** - Fetch compatible bicycles for part

## 📊 Type Definitions

### GetAllPartsParams
```typescript
{
  page?: number;
  limit?: number;
  categoryId?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### PartWithDetails
Extended Part type with:
- `specifications` - Part specifications
- `reviews` - Customer reviews
- `category` - Part category details
- `bicycleCompatibility` - Compatible bicycles with notes
- `_count` - Review and wishlist counts
- `priceBreakdown` - Price with VAT breakdown
- `averageRating` - Average review rating
- `compatibleBicycles` - List of compatible bicycles

### PartCategoryWithCount
Extended PartCategory with:
- `_count.parts` - Number of parts in category
- `childCategories` - Sub-categories
- `parentCategory` - Parent category

## 🔧 Usage Examples

### 1. Get All Parts with Filters
```typescript
import { useAllParts } from '@/lib/api/parts';

const PartsPage = () => {
  const { data, isLoading, error } = useAllParts({
    page: 1,
    limit: 10,
    brand: 'Shimano',
    inStockOnly: true,
    sortBy: 'price',
    sortOrder: 'asc'
  });

  const parts = data?.data || [];
  const pagination = data?.pagination;
};
```

### 2. Get Single Part
```typescript
import { usePart } from '@/lib/api/parts';

const PartDetailPage = ({ partId }: { partId: string }) => {
  const { data, isLoading } = usePart(partId);
  const part = data?.data;
  
  // Access part details
  const price = part?.priceBreakdown?.formatted.grossPrice;
  const compatibleBikes = part?.compatibleBicycles;
};
```

### 3. Get Featured Parts
```typescript
import { useFeaturedParts } from '@/lib/api/parts';

const HomePage = () => {
  const { data } = useFeaturedParts(8);
  const featuredParts = data?.data || [];
};
```

### 4. Get Part Categories
```typescript
import { usePartCategories } from '@/lib/api/parts';

const CategoriesMenu = () => {
  const { data } = usePartCategories();
  const categories = data?.data || [];
  
  // Each category has _count.parts
  categories.map(cat => (
    <div key={cat.id}>
      {cat.name} ({cat._count?.parts} parts)
    </div>
  ));
};
```

### 5. Get Parts by Category
```typescript
import { usePartsByCategory } from '@/lib/api/parts';

const CategoryPage = ({ categoryId }: { categoryId: string }) => {
  const { data } = usePartsByCategory(categoryId, 20);
  const parts = data?.data || [];
};
```

### 6. Get Compatible Parts for Bicycle
```typescript
import { useCompatibleParts } from '@/lib/api/parts';

const BicycleDetailPage = ({ bicycleId }: { bicycleId: string }) => {
  const { data } = useCompatibleParts(bicycleId);
  const compatibleParts = data?.data || [];
  
  // Show compatible parts for this bicycle
};
```

### 7. Get Compatible Bicycles for Part
```typescript
import { useCompatibleBicycles } from '@/lib/api/parts';

const PartDetailPage = ({ partId }: { partId: string }) => {
  const { data } = useCompatibleBicycles(partId);
  const compatibleBicycles = data?.data || [];
  const count = data?.count;
  
  // Show which bicycles this part fits
};
```

## 🎨 Response Structures

### Parts List Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Single Part Response
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Shimano Deore Brake Set",
    "brand": "Shimano",
    "price": "79.99",
    "priceBreakdown": {
      "netPrice": 66.66,
      "vatAmount": 13.33,
      "grossPrice": 79.99,
      "formatted": {
        "netPrice": "£66.66",
        "vatAmount": "£13.33",
        "grossPrice": "£79.99"
      }
    },
    "category": {...},
    "images": [...],
    "compatibleBicycles": [...]
  }
}
```

## ⚙️ Configuration

### Stale Time
- **Parts data**: 5 minutes
- **Categories**: 10 minutes (changes less frequently)

### Retry Policy
- All queries retry up to 2 times on failure

### Query Keys
- Parts: `['parts', 'all', params]`
- Single Part: `['parts', id]`
- Featured: `['parts', 'featured', limit]`
- Categories: `['part-categories', 'all']`
- Category: `['part-categories', id]`
- By Category: `['parts', 'category', categoryId, limit]`
- Compatible Parts: `['bicycles', bicycleId, 'compatible-parts']`
- Compatible Bicycles: `['parts', partId, 'compatible-bicycles']`

## 🔐 Authentication

All API calls automatically include the JWT token from `tokenStorage` via the `apiClient`.

## 🚀 Next Steps

1. Create Part Card component (similar to BicycleCard)
2. Create Parts listing page
3. Create Part detail page
4. Add parts to cart functionality
5. Create category navigation
6. Add compatibility checker UI
