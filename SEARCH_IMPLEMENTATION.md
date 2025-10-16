# Search System Implementation

## Overview
Complete search system with unified search, bicycle-only search, and parts-only search, integrated with TanStack Query for optimal performance.

## 📁 Files Created/Modified

### **API Integration** (`lib/api/search.ts`)
- ✅ 3 search endpoints integrated
- ✅ TanStack Query hooks with debouncing
- ✅ Comprehensive utility functions
- ✅ Type-safe interfaces

### **Search Page** (`app/search/page.tsx`)
- Full-featured search interface
- Advanced filters and facets
- Pagination support
- Responsive design

### **Search Modal** (`components/SearchModal.tsx`)
- Quick search from navbar
- Real-time search with debouncing
- Shows top 6 results
- Links to full search page

## 🔌 API Endpoints

### 1. **Unified Search** (Bicycles + Parts)
**Endpoint:** `GET /api/search`

**Query Parameters:**
- `q` (required): Search query (max 200 chars)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `inStockOnly` (optional): Show only in-stock items
- `sortBy` (optional): relevance|price|name|createdAt
- `sortOrder` (optional): asc|desc

**Response:**
```typescript
{
  success: boolean;
  results: SearchResultItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  facets: {
    brands: { name: string; count: number }[];
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
  };
  searchTime: number; // milliseconds
}
```

### 2. **Search Bicycles Only**
**Endpoint:** `GET /api/search/bicycles`
- Same parameters and response as unified search
- Returns only bicycle results

### 3. **Search Parts Only**
**Endpoint:** `GET /api/search/parts`
- Same parameters and response as unified search
- Returns only parts results

## 🎯 Features

### Search Page (`/search`)

#### **Search Interface**
- ✅ Large search input with submit button
- ✅ Search type tabs (All, Bicycles, Parts)
- ✅ Show/Hide filters toggle
- ✅ Real-time URL updates

#### **Filters**
- ✅ Sort by (Relevance, Price, Name, Newest)
- ✅ Sort order (Ascending, Descending)
- ✅ Price range (Min/Max inputs)
- ✅ In stock only checkbox
- ✅ Brand facets (clickable list)
- ✅ Category facets (clickable list)
- ✅ Clear all filters button

#### **Results Display**
- ✅ Product cards with type badges
- ✅ Bicycle/Part icons
- ✅ Price display
- ✅ Stock status
- ✅ Relevance score
- ✅ Loading states
- ✅ Error states
- ✅ Empty states
- ✅ Pagination

#### **Facets**
- ✅ Dynamic brand list with counts
- ✅ Dynamic category list with counts
- ✅ Price range statistics
- ✅ Expandable/collapsible sections

### Search Modal (Navbar)

#### **Quick Search**
- ✅ Opens from navbar search icon
- ✅ 300ms debounced search
- ✅ Shows top 6 results
- ✅ Loading indicator
- ✅ Type badges (Bicycle/Part)
- ✅ Stock status
- ✅ Relevance scores

#### **Navigation**
- ✅ Click result to go to product page
- ✅ Press Enter to view all results
- ✅ "View all X results" button
- ✅ Auto-close on selection
- ✅ Escape key to close

## 📊 Type Definitions

### **SearchParams**
```typescript
interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  brand?: string;
  inStockOnly?: boolean;
  sortBy?: 'relevance' | 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### **SearchResultItem**
```typescript
interface SearchResultItem {
  id: string;
  type: 'bicycle' | 'part';
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  slug?: string; // Only for parts
  relevanceScore: number;
}
```

### **SearchFacets**
```typescript
interface SearchFacets {
  brands: BrandFacet[];
  categories: CategoryFacet[];
  priceRanges: PriceRangeFacet[];
}
```

## 🔧 TanStack Query Hooks

### **useSearchAll**
```typescript
const { data, isLoading, error } = useSearchAll(params, enabled);
```
- Unified search for bicycles and parts
- Auto-enabled when query is not empty
- 5-minute stale time

### **useSearchBicycles**
```typescript
const { data, isLoading, error } = useSearchBicycles(params, enabled);
```
- Bicycle-only search
- Same configuration as unified search

### **useSearchParts**
```typescript
const { data, isLoading, error } = useSearchParts(params, enabled);
```
- Parts-only search
- Same configuration as unified search

## 🛠️ Utility Functions

### **formatPrice(price: number)**
Formats price in GBP with 2 decimal places

### **getProductUrl(item: SearchResultItem)**
Returns correct URL based on product type
- Bicycles: `/bicycles/:id`
- Parts: `/parts/:slug`

### **isInStock(item: SearchResultItem)**
Checks if product is in stock

### **getStockStatus(item: SearchResultItem)**
Returns stock status text:
- "Out of Stock"
- "Only X left"
- "In Stock"

### **getStockStatusColor(item: SearchResultItem)**
Returns Tailwind color class for stock status

### **formatSearchTime(milliseconds: number)**
Formats search execution time

### **validateSearchQuery(query: string)**
Validates search query (max 200 chars)

### **getDefaultSearchParams(query: string)**
Returns default search parameters

## 🎨 UI/UX Features

### **Search Page**
- ✅ Responsive grid layout
- ✅ Sticky filters sidebar
- ✅ Smooth animations
- ✅ Loading skeletons
- ✅ Error boundaries
- ✅ Empty state illustrations
- ✅ Pagination controls
- ✅ URL state management

### **Search Modal**
- ✅ Backdrop blur
- ✅ Modal animations
- ✅ Auto-focus input
- ✅ Keyboard navigation
- ✅ Debounced search
- ✅ Loading indicators
- ✅ Result highlighting

## 🚀 Performance Optimizations

1. **Debouncing** - 300ms delay on search input
2. **Query Caching** - 5-minute stale time
3. **Pagination** - Load only 20 results at a time
4. **Lazy Loading** - Results load on demand
5. **Conditional Queries** - Only search when query exists
6. **URL State** - Preserve search state in URL

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Collapsible filters on mobile
- ✅ Touch-friendly buttons
- ✅ Responsive grid (1-3 columns)
- ✅ Sticky headers
- ✅ Optimized for all screen sizes

## 🔍 Search Features

### **Relevance Scoring**
- Backend calculates relevance scores
- Results sorted by relevance by default
- Score displayed for transparency

### **Faceted Search**
- Dynamic brand filtering
- Dynamic category filtering
- Price range filtering
- Stock availability filtering

### **Multi-field Search**
Searches across:
- Product name
- Brand
- Model
- Description
- Category

## 📝 Usage Examples

### **Basic Search**
```typescript
const { data } = useSearchAll({ q: 'mountain bike' });
```

### **Filtered Search**
```typescript
const { data } = useSearchAll({
  q: 'brake',
  category: 'Brakes',
  minPrice: 50,
  maxPrice: 150,
  inStockOnly: true,
  sortBy: 'price',
  sortOrder: 'asc',
});
```

### **Paginated Search**
```typescript
const { data } = useSearchBicycles({
  q: 'road bike',
  page: 2,
  limit: 20,
});
```

## 🎯 User Flows

### **Quick Search Flow**
1. User clicks search icon in navbar
2. Modal opens with auto-focused input
3. User types query (debounced 300ms)
4. Top 6 results appear instantly
5. User clicks result → Goes to product page
6. OR presses Enter → Goes to full search page

### **Advanced Search Flow**
1. User navigates to `/search` or uses quick search
2. Enters search query
3. Selects search type (All/Bicycles/Parts)
4. Applies filters (price, brand, category, stock)
5. Views paginated results
6. Clicks facets to refine search
7. Navigates to product pages

## 🔒 Security

- ✅ Query validation (max 200 chars)
- ✅ Input sanitization
- ✅ Rate limiting (backend)
- ✅ SQL injection prevention (backend)

## ✅ Testing Checklist

- [ ] Search with various queries
- [ ] Test all filter combinations
- [ ] Verify pagination works
- [ ] Check facet filtering
- [ ] Test empty states
- [ ] Verify error handling
- [ ] Test mobile responsiveness
- [ ] Check keyboard navigation
- [ ] Verify URL state persistence
- [ ] Test debouncing behavior

## 📈 Future Enhancements

1. **Search Suggestions** - Autocomplete suggestions
2. **Search History** - Recent searches
3. **Saved Searches** - Save favorite searches
4. **Advanced Filters** - More filter options
5. **Search Analytics** - Track popular searches
6. **Voice Search** - Speech-to-text search
7. **Image Search** - Search by image upload
8. **Synonyms** - Handle search synonyms
