# 💝 Wishlist API Integration

Complete wishlist functionality with TanStack Query hooks and Zustand store for state management.

## 📁 Files Created

### **1. API Layer** (`lib/api/wishlist.ts`)
- TanStack Query hooks for wishlist operations
- Type-safe API functions
- Automatic cache invalidation

### **2. Zustand Store** (`lib/stores/wishlistStore.ts`)
- Client-side state management
- LocalStorage persistence
- Optimistic UI updates

### **3. Combined Hook** (`lib/hooks/useWishlist.ts`)
- Unified interface for wishlist operations
- Syncs API data with Zustand store
- Handles authentication state

### **4. Updated Components**
- `components/BicycleCard.tsx` - Wishlist heart button
- `app/wishlist/page.tsx` - Wishlist page with grid view

## 🎯 API Endpoints

### **Add to Wishlist**
```bash
POST /api/bicycles/{bicycleId}/wishlist
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to wishlist successfully"
}
```

### **Remove from Wishlist**
```bash
DELETE /api/bicycles/{bicycleId}/wishlist
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Removed from wishlist successfully"
}
```

### **Get My Wishlist**
```bash
GET /api/bicycles/wishlist/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wishlist-id",
      "userId": "user-id",
      "bicycleId": "bicycle-id",
      "partId": null,
      "createdAt": "2025-10-12T12:57:32.585Z",
      "bicycle": {
        "id": "bicycle-id",
        "name": "MK21 Bike 2025",
        "brand": "MK",
        "model": "Allez Elite Pro",
        "price": "1200",
        "stockQuantity": 15,
        "images": [...]
      }
    }
  ],
  "count": 1
}
```

## 🔧 Usage

### **In Components**

```typescript
import { useWishlist } from "@/lib/hooks/useWishlist";

function MyComponent() {
  const { 
    items,           // Wishlist items
    count,           // Total count
    isLoading,       // Loading state
    add,             // Add to wishlist
    remove,          // Remove from wishlist
    toggle,          // Toggle wishlist status
    isInWishlist,    // Check if item is in wishlist
  } = useWishlist();

  // Add to wishlist
  const handleAdd = async () => {
    const result = await add(bicycleId);
    if (result.success) {
      console.log("Added to wishlist!");
    }
  };

  // Toggle wishlist
  const handleToggle = async () => {
    await toggle(bicycleId);
  };

  // Check if in wishlist
  const inWishlist = isInWishlist(bicycleId);

  return (
    <button onClick={handleToggle}>
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </button>
  );
}
```

### **Direct Store Access**

```typescript
import { useWishlistStore } from "@/lib/stores/wishlistStore";

function MyComponent() {
  const items = useWishlistStore((state) => state.items);
  const count = useWishlistStore((state) => state.getItemCount());
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  
  return <div>Wishlist: {count} items</div>;
}
```

### **Direct API Calls**

```typescript
import { 
  useAddToWishlist, 
  useRemoveFromWishlist,
  useWishlist as useWishlistQuery 
} from "@/lib/api/wishlist";

function MyComponent() {
  const { data, isLoading } = useWishlistQuery();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const handleAdd = () => {
    addMutation.mutate(bicycleId);
  };

  return <div>...</div>;
}
```

## 🎨 Features

### **BicycleCard Component**
- ✅ Heart icon button (floating on image)
- ✅ Filled heart when in wishlist
- ✅ Optimistic UI updates
- ✅ Loading state (disabled button)
- ✅ Redirects to login if not authenticated
- ✅ Smooth animations with Framer Motion

### **Wishlist Page**
- ✅ Grid view of wishlist items
- ✅ Remove button on each item
- ✅ Add to cart button
- ✅ Stock status badges
- ✅ Empty state with CTA
- ✅ Loading state
- ✅ Item count display
- ✅ Continue shopping link

### **Zustand Store**
- ✅ LocalStorage persistence
- ✅ Optimistic updates
- ✅ Item count helper
- ✅ isInWishlist checker
- ✅ Clear wishlist function
- ✅ Auto-sync with API

### **API Integration**
- ✅ TanStack Query hooks
- ✅ Automatic cache invalidation
- ✅ Error handling
- ✅ Loading states
- ✅ Type safety with TypeScript

## 🔐 Authentication

All wishlist operations require authentication:
- User must be signed in with Clerk
- JWT token automatically included in requests
- Redirects to login if not authenticated
- Wishlist cleared on sign out

## 📊 State Management

### **Data Flow**
1. User clicks wishlist button
2. Hook calls API endpoint
3. API updates database
4. TanStack Query invalidates cache
5. Fresh data fetched from API
6. Zustand store updated
7. UI re-renders with new state

### **Persistence**
- Zustand store persists to localStorage
- Syncs with API on mount
- Clears on sign out
- Survives page refreshes

## 🎯 Routes

| Route | Description |
|-------|-------------|
| `/wishlist` | View all wishlist items |
| `/shop/bicycles` | Browse bicycles (with wishlist buttons) |
| `/shop/bicycles/[id]` | Bicycle detail (with wishlist button) |

## ✨ UI/UX Features

### **Visual Feedback**
- Heart fills with red when in wishlist
- Button disabled during API calls
- Smooth animations on hover/click
- Loading spinner on wishlist page

### **User Experience**
- One-click add/remove
- Optimistic UI updates
- Persistent across sessions
- Mobile responsive
- Accessible (aria-labels)

## 🚀 Next Steps

### **TODO Features**
- [ ] Move to cart from wishlist
- [ ] Share wishlist
- [ ] Wishlist notifications (price drops)
- [ ] Bulk actions (clear all, move all to cart)
- [ ] Wishlist analytics
- [ ] Email reminders

### **Optimizations**
- [ ] Infinite scroll on wishlist page
- [ ] Image lazy loading
- [ ] Debounced API calls
- [ ] Optimistic UI for remove
- [ ] Toast notifications

## 🎉 Summary

Complete wishlist system with:
- ✅ Full CRUD operations
- ✅ TanStack Query integration
- ✅ Zustand state management
- ✅ LocalStorage persistence
- ✅ Type-safe TypeScript
- ✅ Authentication required
- ✅ Optimistic UI updates
- ✅ Beautiful animations
- ✅ Mobile responsive
- ✅ Production ready

Ready to use! 💝
