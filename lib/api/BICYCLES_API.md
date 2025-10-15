# 🚴 Bicycles API Integration

## ✅ What's Been Added

Featured bicycles from your backend are now displayed on the homepage with full API integration.

## 📁 Files Created

### New Files
- ✅ `lib/api/bicycles.ts` - TanStack Query hooks for bicycles API
- ✅ `components/BicycleCard.tsx` - Beautiful bicycle card component
- ✅ `lib/api/BICYCLES_API.md` - This documentation

### Modified Files
- ✅ `app/page.tsx` - Updated to fetch and display featured bicycles from backend

## 🎯 Features

### BicycleCard Component
- **Image Display** - Shows primary image from Cloudinary
- **Featured Badge** - Highlights featured bicycles
- **Stock Indicators** - Shows "Out of Stock" or "Only X left" badges
- **Specs Display** - Frame size, material, and year
- **Price & Warranty** - Clear pricing with warranty info
- **Action Buttons** - Add to wishlist and cart
- **Hover Effects** - Smooth animations and transitions

### API Integration
- **Auto-fetching** - Fetches 8 featured bicycles on page load
- **Loading State** - Skeleton loaders while fetching
- **Empty State** - Graceful handling when no bicycles available
- **Caching** - 5-minute cache with TanStack Query
- **Error Handling** - Automatic retry on failure

## 🔧 API Endpoint

**GET** `/api/bicycles/featured?limit=8`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmgnbvjj30000v604b2zhl7lg",
      "name": "Road Bike Pro 2024",
      "brand": "Specialized",
      "model": "Allez Elite",
      "year": "2024",
      "category": "ROAD",
      "frameSize": "56cm",
      "frameMaterial": "Aluminum",
      "color": "Red",
      "description": "High-performance road bike",
      "price": "1150",
      "stockQuantity": 25,
      "isActive": true,
      "isFeatured": true,
      "weight": "9.5kg",
      "warrantyPeriod": "2 years",
      "createdAt": "2025-10-12T06:33:16.897Z",
      "updatedAt": "2025-10-12T06:35:27.091Z",
      "images": [
        {
          "id": "cmgnd2smc0001v66ke98kg80s",
          "bicycleId": "cmgnbvjj30000v604b2zhl7lg",
          "cloudinaryUrl": "https://res.cloudinary.com/...",
          "publicId": "bicycle-business/bicycles/...",
          "altText": null,
          "isPrimary": true,
          "sortOrder": 0,
          "createdAt": "2025-10-12T07:06:54.877Z"
        }
      ]
    }
  ]
}
```

## 📚 Usage Examples

### Fetch Featured Bicycles

```tsx
import { useFeaturedBicycles } from '@/lib/api/bicycles';

function MyComponent() {
  const { data, isLoading, error } = useFeaturedBicycles(8);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading bicycles</div>;
  
  const bicycles = data?.data || [];
  
  return (
    <div className="grid grid-cols-4 gap-6">
      {bicycles.map(bicycle => (
        <BicycleCard key={bicycle.id} bicycle={bicycle} />
      ))}
    </div>
  );
}
```

### Display Single Bicycle

```tsx
import BicycleCard from '@/components/BicycleCard';

function MyComponent() {
  const bicycle = {
    id: "123",
    name: "Mountain Bike Pro",
    brand: "Trek",
    // ... other fields
  };
  
  return <BicycleCard bicycle={bicycle} />;
}
```

## 🎨 Bicycle Card Features

### Badges
- **Featured** - Blue badge for featured bicycles
- **Out of Stock** - Red badge when stockQuantity = 0
- **Low Stock** - Orange badge when stockQuantity ≤ 5

### Specs Displayed
- Frame size (e.g., "56cm")
- Frame material (e.g., "Aluminum")
- Year (e.g., "2024")
- Category (e.g., "ROAD")
- Brand (e.g., "Specialized")

### Actions
- **Wishlist Button** - Heart icon (gray → blue on hover)
- **Add to Cart** - Shopping cart icon (disabled if out of stock)
- **View Details** - Click anywhere on card to view details

## 🔄 Data Flow

```
Homepage Loads
    ↓
useFeaturedBicycles(8) hook called
    ↓
GET /api/bicycles/featured?limit=8
    ↓
Backend returns featured bicycles
    ↓
Data cached for 5 minutes
    ↓
BicycleCard components rendered
    ↓
Images loaded from Cloudinary
```

## 🎯 Type Safety

Full TypeScript support with interfaces:

```typescript
interface Bicycle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  category: 'ROAD' | 'MOUNTAIN' | 'HYBRID' | 'ELECTRIC' | 'BMX' | 'KIDS';
  frameSize: string;
  frameMaterial: string;
  color: string;
  description: string;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  weight: string;
  warrantyPeriod: string;
  images: BicycleImage[];
}
```

## 🚀 Next Steps

You can extend this pattern for:
1. **All Bicycles** - Create `useAllBicycles()` hook
2. **Bicycle Details** - Create `useBicycle(id)` hook
3. **Filter/Search** - Add query params to API calls
4. **Categories** - Create `useBicyclesByCategory()` hook
5. **Cart Integration** - Connect "Add to Cart" button to cart store

## 📝 Example: Add More Endpoints

```typescript
// In lib/api/bicycles.ts

// Get all bicycles with filters
export const useAllBicycles = (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  return useQuery({
    queryKey: ['bicycles', 'all', filters],
    queryFn: () => apiClient.get('/api/bicycles', { params: filters }),
  });
};

// Get single bicycle
export const useBicycle = (id: string) => {
  return useQuery({
    queryKey: ['bicycles', id],
    queryFn: () => apiClient.get(`/api/bicycles/${id}`),
    enabled: !!id,
  });
};
```

## ✨ What's Working

1. ✅ Featured bicycles fetched from backend
2. ✅ Beautiful card UI with all bicycle details
3. ✅ Loading states with skeleton loaders
4. ✅ Empty state handling
5. ✅ Stock indicators and badges
6. ✅ Cloudinary image integration
7. ✅ Responsive grid layout
8. ✅ Smooth animations
9. ✅ Type-safe API calls
10. ✅ Automatic caching and refetching

The homepage now displays real bicycles from your backend! 🎉
