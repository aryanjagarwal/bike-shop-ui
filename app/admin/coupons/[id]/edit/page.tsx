"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Calendar, Percent, Save } from "lucide-react";
import Link from "next/link";
import { useUpdateCoupon, useGetAllCoupons } from "@/lib/api/admin/coupons";
import { DiscountType } from "@/lib/types/allTypes";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;

  const { data: couponsData, isLoading: loadingCoupons } = useGetAllCoupons({
    includeInactive: true,
  });
  const updateCoupon = useUpdateCoupon();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: DiscountType.PERCENTAGE,
    discountValue: "",
    minOrderAmount: "",
    usageLimit: "",
    isActive: true,
    validFrom: "",
    validUntil: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load coupon data
  useEffect(() => {
    if (couponsData?.data && !isInitialized) {
      const coupon = couponsData.data.find((c) => c.id === couponId);
      if (coupon) {
        // Convert ISO strings to datetime-local format
        const formatDateTimeLocal = (isoString: string) => {
          const date = new Date(isoString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || "",
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          usageLimit: String(coupon.usageLimit),
          isActive: coupon.isActive || false,
          validFrom: formatDateTimeLocal(coupon.validFrom),
          validUntil: formatDateTimeLocal(coupon.validUntil),
        });
        setIsInitialized(true);
      }
    }
  }, [couponsData, couponId, isInitialized]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Coupon name is required";
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }

    if (
      formData.discountType === DiscountType.PERCENTAGE &&
      parseFloat(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100";
    }

    if (!formData.minOrderAmount || parseFloat(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Minimum order amount must be 0 or greater";
    }

    if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
      newErrors.usageLimit = "Usage limit must be greater than 0";
    }

    if (!formData.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Valid until date is required";
    }

    if (formData.validFrom && formData.validUntil) {
      const from = new Date(formData.validFrom);
      const until = new Date(formData.validUntil);
      if (until <= from) {
        newErrors.validUntil = "Valid until must be after valid from date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateCoupon.mutate(
      {
        couponId,
        request: {
          name: formData.name,
          description: formData.description || undefined,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minOrderAmount: parseFloat(formData.minOrderAmount),
          usageLimit: parseInt(formData.usageLimit),
          isActive: formData.isActive,
          validFrom: new Date(formData.validFrom).toISOString(),
          validUntil: new Date(formData.validUntil).toISOString(),
        },
      },
      {
        onSuccess: () => {
          alert("Coupon updated successfully!");
          router.push("/admin/coupons");
        },
        onError: (error: any) => {
          alert(`Failed to update coupon: ${error.message || "Unknown error"}`);
        },
      }
    );
  };

  if (loadingCoupons) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading coupon...</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-600">Coupon not found</p>
        <Link href="/admin/coupons">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Coupons
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Edit Coupon</h2>
            <p className="text-gray-600 mt-1">
              Update coupon details for{" "}
              <span className="font-mono font-semibold text-blue-600">
                {formData.code}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed uppercase font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Coupon code cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Summer Sale 2025"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description for internal use"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Discount Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-green-600" />
              Discount Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={DiscountType.PERCENTAGE}>Percentage</option>
                  <option value={DiscountType.FIXED_AMOUNT}>Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.discountValue ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {formData.discountType === DiscountType.PERCENTAGE ? "%" : "£"}
                  </span>
                </div>
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Order Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    £
                  </span>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.minOrderAmount ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.minOrderAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.minOrderAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Usage & Validity */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Usage & Validity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.usageLimit ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-sm mt-1">{errors.usageLimit}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of times this coupon can be used
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validFrom ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.validFrom && (
                  <p className="text-red-500 text-sm mt-1">{errors.validFrom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validUntil ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.validUntil && (
                  <p className="text-red-500 text-sm mt-1">{errors.validUntil}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (coupon can be used)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={updateCoupon.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateCoupon.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Coupon
                </>
              )}
            </button>
            <Link href="/admin/coupons" className="flex-1">
              <button
                type="button"
                className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
