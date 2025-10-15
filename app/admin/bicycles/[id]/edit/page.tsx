"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useBicycle } from "@/lib/api/bicycles";
import {
  useUpdateBicycle,
  useUploadBicycleImages,
  useDeleteBicycleImage,
} from "@/lib/api/admin/bicycles";
import { BicycleCategory } from "@/lib/types/allTypes";

export default function EditBicyclePage() {
  const router = useRouter();
  const params = useParams();
  const bicycleId = params.id as string;

  const { data, isLoading, error } = useBicycle(bicycleId);
  const updateBicycle = useUpdateBicycle();
  const uploadImages = useUploadBicycleImages();
  const deleteImage = useDeleteBicycleImage();

  const bicycle = data?.data;

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    category: BicycleCategory.ROAD,
    frameSize: "",
    frameMaterial: "",
    color: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    weight: "",
    warrantyPeriod: "",
    isFeatured: false,
    isActive: true,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Populate form when bicycle data loads
  useEffect(() => {
    if (bicycle) {
      setFormData({
        name: bicycle.name,
        brand: bicycle.brand,
        model: bicycle.model,
        year: bicycle.year,
        category: bicycle.category as BicycleCategory,
        frameSize: bicycle.frameSize,
        frameMaterial: bicycle.frameMaterial,
        color: bicycle.color,
        description: bicycle.description || "",
        price: parseFloat(bicycle.price),
        stockQuantity: bicycle.stockQuantity,
        weight: bicycle.weight || "",
        warrantyPeriod: bicycle.warrantyPeriod || "",
        isFeatured: bicycle.isFeatured,
        isActive: bicycle.isActive,
      });
    }
  }, [bicycle]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage.mutate(
        { bicycleId, imageId },
        {
          onSuccess: () => {
            alert("Image deleted successfully");
          },
          onError: (error) => {
            alert("Failed to delete image");
            console.error(error);
          },
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Update bicycle
    updateBicycle.mutate(
      {
        id: bicycleId,
        data: formData,
      },
      {
        onSuccess: async () => {
          // Step 2: Upload new images if any
          if (newImages.length > 0) {
            uploadImages.mutate(
              {
                bicycleId,
                data: {
                  images: newImages,
                  isPrimary: bicycle?.images?.length === 0, // Set as primary if no existing images
                },
              },
              {
                onSuccess: () => {
                  alert("Bicycle updated with new images successfully!");
                  router.push("/admin/bicycles");
                },
                onError: (error) => {
                  console.error("Image upload failed:", error);
                  alert("Bicycle updated but image upload failed");
                  router.push("/admin/bicycles");
                },
              }
            );
          } else {
            alert("Bicycle updated successfully!");
            router.push("/admin/bicycles");
          }
        },
        onError: (error) => {
          console.error("Failed to update bicycle:", error);
          alert("Failed to update bicycle");
        },
      }
    );
  };

  const isSubmitting = updateBicycle.isPending || uploadImages.isPending;

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bicycle...</p>
        </div>
      </div>
    );
  }

  if (error || !bicycle) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-red-600">Failed to load bicycle</p>
          <Link href="/admin/bicycles">
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Back to Bicycles
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/bicycles">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Edit Bicycle</h2>
            <p className="text-gray-600">Update bicycle information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="text"
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as BicycleCategory,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={BicycleCategory.ROAD}>Road</option>
                  <option value={BicycleCategory.MOUNTAIN}>Mountain</option>
                  <option value={BicycleCategory.HYBRID}>Hybrid</option>
                  <option value={BicycleCategory.ELECTRIC}>Electric</option>
                  <option value={BicycleCategory.KIDS}>Kids</option>
                  <option value={BicycleCategory.BMX}>BMX</option>
                  <option value={BicycleCategory.FOLDING}>Folding</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  required
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Size *
                </label>
                <input
                  type="text"
                  required
                  value={formData.frameSize}
                  onChange={(e) =>
                    setFormData({ ...formData, frameSize: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Material *
                </label>
                <input
                  type="text"
                  required
                  value={formData.frameMaterial}
                  onChange={(e) =>
                    setFormData({ ...formData, frameMaterial: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Period
                </label>
                <input
                  type="text"
                  value={formData.warrantyPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyPeriod: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (£) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockQuantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Existing Images */}
          {bicycle.images && bicycle.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {bicycle.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={image.cloudinaryUrl}
                        alt={bicycle.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Primary
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleteImage.isPending}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              >
                Click to upload new images
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG up to 10MB (multiple files allowed)
              </p>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Featured Product
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Updating..." : "Update Bicycle"}
            </button>
            <Link href="/admin/bicycles">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
