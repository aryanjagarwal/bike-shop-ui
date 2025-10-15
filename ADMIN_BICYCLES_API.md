# 🔧 Admin Bicycles API Integration

Complete API integration for admin bicycle management with TanStack Query hooks.

## 📁 Files Created

### **New Files**
- ✅ `lib/api/admin/bicycles.ts` - Admin bicycle management hooks

## 🎯 Admin API Endpoints

| Method | Endpoint | Hook | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/bicycles` | `useCreateBicycle()` | Create new bicycle |
| `PUT` | `/api/bicycles/:id` | `useUpdateBicycle()` | Update bicycle |
| `PUT` | `/api/bicycles/:id` | `useUpdateBicycleStock()` | Update stock |
| `DELETE` | `/api/bicycles/:id` | `useDeleteBicycle()` | Delete (soft delete) |
| `POST` | `/api/bicycles/:id/images` | `useUploadBicycleImages()` | Upload images |
| `DELETE` | `/api/bicycles/:id/images/:imageId` | `useDeleteBicycleImage()` | Delete image |

## 🚀 Usage Examples

### 1. **Create Bicycle**

```typescript
import { useCreateBicycle } from '@/lib/api/admin/bicycles';
import { BicycleCategory } from '@/lib/types/allTypes';

function CreateBicycleForm() {
  const createBicycle = useCreateBicycle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createBicycle.mutate({
      name: "Road Bike Pro 2025",
      brand: "Specialized",
      model: "Allez Elite",
      year: "2024",
      category: BicycleCategory.ROAD,
      frameSize: "56cm",
      frameMaterial: "Aluminum",
      color: "Red",
      description: "High-performance road bike",
      price: 1200.00,
      stockQuantity: 15,
      weight: "9.5kg",
      warrantyPeriod: "2 years",
      isFeatured: true,
    }, {
      onSuccess: (response) => {
        console.log('Bicycle created:', response.data);
        // Show success message
      },
      onError: (error) => {
        console.error('Failed to create bicycle:', error);
        // Show error message
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createBicycle.isPending}
      >
        {createBicycle.isPending ? 'Creating...' : 'Create Bicycle'}
      </button>
    </form>
  );
}
```

### 2. **Update Bicycle**

```typescript
import { useUpdateBicycle } from '@/lib/api/admin/bicycles';

function EditBicycleForm({ bicycleId }: { bicycleId: string }) {
  const updateBicycle = useUpdateBicycle();

  const handleUpdate = () => {
    updateBicycle.mutate({
      id: bicycleId,
      data: {
        price: 1150.00,
        stockQuantity: 20,
      },
    }, {
      onSuccess: () => {
        console.log('Bicycle updated successfully');
      },
    });
  };

  return (
    <button onClick={handleUpdate} disabled={updateBicycle.isPending}>
      {updateBicycle.isPending ? 'Updating...' : 'Update Bicycle'}
    </button>
  );
}
```

### 3. **Update Stock**

```typescript
import { useUpdateBicycleStock } from '@/lib/api/admin/bicycles';

function StockManager({ bicycleId }: { bicycleId: string }) {
  const updateStock = useUpdateBicycleStock();

  const handleStockUpdate = (newQuantity: number) => {
    updateStock.mutate({
      id: bicycleId,
      data: {
        stockQuantity: newQuantity,
        reason: "New stock from supplier",
      },
    }, {
      onSuccess: () => {
        console.log('Stock updated');
      },
    });
  };

  return (
    <button onClick={() => handleStockUpdate(25)}>
      Update Stock
    </button>
  );
}
```

### 4. **Delete Bicycle**

```typescript
import { useDeleteBicycle } from '@/lib/api/admin/bicycles';

function DeleteBicycleButton({ bicycleId }: { bicycleId: string }) {
  const deleteBicycle = useDeleteBicycle();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this bicycle?')) {
      deleteBicycle.mutate(bicycleId, {
        onSuccess: () => {
          console.log('Bicycle deleted successfully');
        },
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={deleteBicycle.isPending}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      {deleteBicycle.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### 5. **Upload Images**

```typescript
import { useUploadBicycleImages } from '@/lib/api/admin/bicycles';

function ImageUploader({ bicycleId }: { bicycleId: string }) {
  const uploadImages = useUploadBicycleImages();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      uploadImages.mutate({
        bicycleId,
        data: {
          images: files,
          isPrimary: true, // First image will be primary
        },
      }, {
        onSuccess: (response) => {
          console.log('Images uploaded:', response.data);
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploadImages.isPending}
      />
      {uploadImages.isPending && <p>Uploading...</p>}
    </div>
  );
}
```

### 6. **Delete Image**

```typescript
import { useDeleteBicycleImage } from '@/lib/api/admin/bicycles';

function ImageGallery({ bicycleId, images }: { bicycleId: string; images: BicycleImage[] }) {
  const deleteImage = useDeleteBicycleImage();

  const handleDeleteImage = (imageId: string) => {
    deleteImage.mutate({
      bicycleId,
      imageId,
    }, {
      onSuccess: () => {
        console.log('Image deleted');
      },
    });
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative">
          <img src={image.cloudinaryUrl} alt="" />
          <button
            onClick={() => handleDeleteImage(image.id)}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Type Definitions

### CreateBicycleRequest
```typescript
interface CreateBicycleRequest {
  name: string;
  brand: string;
  model: string;
  year: string;
  category: string;
  frameSize: string;
  frameMaterial: string;
  color: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight?: string;
  warrantyPeriod?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}
```

### UpdateBicycleRequest
```typescript
interface UpdateBicycleRequest {
  name?: string;
  brand?: string;
  model?: string;
  year?: string;
  category?: string;
  frameSize?: string;
  frameMaterial?: string;
  color?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  weight?: string;
  warrantyPeriod?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}
```

### UpdateStockRequest
```typescript
interface UpdateStockRequest {
  stockQuantity: number;
  reason?: string;
}
```

### UploadImagesRequest
```typescript
interface UploadImagesRequest {
  images: File[];
  isPrimary?: boolean;
}
```

## 🎨 Complete Admin Form Example

```typescript
'use client';

import { useState } from 'react';
import { useCreateBicycle, useUploadBicycleImages } from '@/lib/api/admin/bicycles';
import { BicycleCategory } from '@/lib/types/allTypes';

export default function CreateBicyclePage() {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '2024',
    category: BicycleCategory.ROAD,
    frameSize: '',
    frameMaterial: '',
    color: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    weight: '',
    warrantyPeriod: '',
    isFeatured: false,
  });
  const [images, setImages] = useState<File[]>([]);

  const createBicycle = useCreateBicycle();
  const uploadImages = useUploadBicycleImages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Create bicycle
    createBicycle.mutate(formData, {
      onSuccess: (response) => {
        const bicycleId = response.data?.id;

        // Step 2: Upload images if any
        if (bicycleId && images.length > 0) {
          uploadImages.mutate({
            bicycleId,
            data: {
              images,
              isPrimary: true,
            },
          }, {
            onSuccess: () => {
              alert('Bicycle created with images!');
              // Reset form or redirect
            },
          });
        } else {
          alert('Bicycle created!');
        }
      },
      onError: (error) => {
        alert('Failed to create bicycle');
        console.error(error);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Bicycle</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Stock Quantity</label>
          <input
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={createBicycle.isPending || uploadImages.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {createBicycle.isPending || uploadImages.isPending
            ? 'Creating...'
            : 'Create Bicycle'}
        </button>
      </div>
    </form>
  );
}
```

## ✨ Key Features

✅ **Auto-invalidation** - Automatically refetches data after mutations  
✅ **Loading states** - `isPending` for showing loaders  
✅ **Error handling** - `onError` callbacks  
✅ **Success callbacks** - `onSuccess` for notifications  
✅ **Type-safe** - Full TypeScript support  
✅ **Image upload** - FormData support for file uploads  
✅ **Optimistic updates** - Can be added with `onMutate`  

## 🔄 Auto-Invalidation

All mutation hooks automatically invalidate related queries:

- **Create** → Invalidates `['bicycles']` list
- **Update** → Invalidates `['bicycles', id]` and `['bicycles']`
- **Delete** → Invalidates `['bicycles']` list
- **Upload Images** → Invalidates `['bicycles', id]`
- **Delete Image** → Invalidates `['bicycles', id]`

This ensures the UI always shows the latest data!

## 🎉 Summary

All admin bicycle management APIs are now integrated with:
- ✅ 6 mutation hooks
- ✅ Full CRUD operations
- ✅ Image management
- ✅ Stock management
- ✅ Type-safe requests/responses
- ✅ Automatic cache invalidation
- ✅ Loading and error states

Ready for admin panel integration! 🚀
