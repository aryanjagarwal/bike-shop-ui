"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag,
  Users,
  TrendingUp,
  Calendar,
  X,
  Check,
  UserPlus,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  useGetAllCoupons,
  useDeleteCoupon,
  useGetCouponStats,
  useAssignCoupon,
  useAssignMultipleCoupons,
  useAssignAllCoupons,
  useGetUsers,
  type CouponWithCounts,
} from "@/lib/api/admin/coupons";
import { DiscountType } from "@/lib/types/allTypes";

function AdminCouponsPage() {
  const [includeInactive, setIncludeInactive] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithCounts | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<"single" | "multiple" | "all">("single");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const { data, isLoading, error } = useGetAllCoupons({ includeInactive });
  const deleteCoupon = useDeleteCoupon();
  const assignCoupon = useAssignCoupon();
  const assignMultiple = useAssignMultipleCoupons();
  const assignAll = useAssignAllCoupons();

  const { data: statsData, isLoading: statsLoading } = useGetCouponStats(
    selectedCoupon?.id || "",
    showStatsModal && !!selectedCoupon
  );

  const { data: usersData } = useGetUsers({
    page: 1,
    limit: 50,
    role: "CUSTOMER",
    search: userSearch,
  });

  const coupons = data?.data || [];
  const users = usersData?.data || [];
  const stats = statsData?.data;

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      deleteCoupon.mutate(id, {
        onSuccess: () => {
          alert("Coupon deleted successfully");
        },
        onError: (error) => {
          alert("Failed to delete coupon");
          console.error(error);
        },
      });
    }
  };

  const handleAssign = () => {
    if (!selectedCoupon) return;

    if (assignType === "single" && selectedUsers.length === 1) {
      assignCoupon.mutate(
        {
          couponId: selectedCoupon.id,
          userId: selectedUsers[0],
        },
        {
          onSuccess: () => {
            alert("Coupon assigned successfully");
            setShowAssignModal(false);
            setSelectedUsers([]);
          },
          onError: () => alert("Failed to assign coupon"),
        }
      );
    } else if (assignType === "multiple" && selectedUsers.length > 0) {
      assignMultiple.mutate(
        {
          couponId: selectedCoupon.id,
          userIds: selectedUsers,
        },
        {
          onSuccess: (data) => {
            alert(
              `Coupon assigned to ${data.data.assignedCount} user(s) successfully`
            );
            setShowAssignModal(false);
            setSelectedUsers([]);
          },
          onError: () => alert("Failed to assign coupons"),
        }
      );
    } else if (assignType === "all") {
      if (
        confirm(
          "Are you sure you want to assign this coupon to ALL users? This cannot be undone."
        )
      ) {
        assignAll.mutate(
          { couponId: selectedCoupon.id },
          {
            onSuccess: (data) => {
              alert(
                `Coupon assigned to ${data.data.assignedCount} user(s) successfully`
              );
              setShowAssignModal(false);
            },
            onError: () => alert("Failed to assign coupon to all users"),
          }
        );
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Coupon Management</h2>
            <p className="text-gray-600 mt-1">
              Create and manage discount coupons
            </p>
          </div>
          <Link href="/admin/coupons/create">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Coupon
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show inactive coupons</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coupons...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load coupons. Please try again.
        </div>
      )}

      {/* Coupons List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No coupons found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first coupon to get started
              </p>
              <Link href="/admin/coupons/create">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Coupon
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Discount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Min. Order
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Usage
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Valid Until
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((coupon) => (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <span className="font-mono font-semibold text-sm">
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{coupon.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {coupon.discountType === DiscountType.PERCENTAGE
                            ? `${coupon.discountValue}% OFF`
                            : `£${coupon.discountValue} OFF`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          £{parseFloat(coupon.minOrderAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <span className="font-semibold">
                            {coupon.usedCount}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            / {coupon.usageLimit}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {coupon._count.userCoupons} assigned
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {formatDate(coupon.validUntil)}
                        </div>
                        {isExpired(coupon.validUntil) && (
                          <span className="text-xs text-red-600">Expired</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            coupon.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowStatsModal(true);
                            }}
                            className="p-1 hover:bg-blue-50 rounded transition-colors"
                            title="View Statistics"
                          >
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowAssignModal(true);
                            }}
                            className="p-1 hover:bg-green-50 rounded transition-colors"
                            title="Assign to Users"
                          >
                            <UserPlus className="w-4 h-4 text-green-600" />
                          </button>
                          <Link href={`/admin/coupons/${coupon.id}/edit`}>
                            <button
                              className="p-1 hover:bg-yellow-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-yellow-600" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStatsModal && selectedCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Coupon Statistics</h3>
                  <button
                    onClick={() => setShowStatsModal(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <span className="font-mono font-semibold text-blue-600">
                    {selectedCoupon.code}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {selectedCoupon.name}
                  </span>
                </div>
              </div>

              {statsLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading statistics...</p>
                </div>
              ) : stats ? (
                <div className="p-6 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.stats.totalUsed}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Times Used
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.stats.remainingUses}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Remaining Uses
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        £{stats.stats.totalDiscountGiven.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Total Discount
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.stats.totalAssigned}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Total Assigned
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-indigo-600">
                        {stats.stats.totalRedeemed}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Total Redeemed
                      </div>
                    </div>
                  </div>

                  {/* Assigned Users */}
                  {stats.coupon.userCoupons &&
                    stats.coupon.userCoupons.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Assigned Users</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {stats.coupon.userCoupons.map((uc) => (
                            <div
                              key={uc.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <div className="font-medium">
                                  {uc.user.firstName} {uc.user.lastName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {uc.user.email}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-xs font-medium ${
                                    uc.isRedeemed
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {uc.isRedeemed ? "Redeemed" : "Not Redeemed"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Issued: {formatDate(uc.issuedAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && selectedCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Assign Coupon to Users</h3>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUsers([]);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <span className="font-mono font-semibold text-blue-600">
                    {selectedCoupon.code}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Assignment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAssignType("single");
                        setSelectedUsers([]);
                      }}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        assignType === "single"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Single User
                    </button>
                    <button
                      onClick={() => {
                        setAssignType("multiple");
                        setSelectedUsers([]);
                      }}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        assignType === "multiple"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Multiple Users
                    </button>
                    <button
                      onClick={() => {
                        setAssignType("all");
                        setSelectedUsers([]);
                      }}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        assignType === "all"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      All Users
                    </button>
                  </div>
                </div>

                {/* User Selection */}
                {assignType !== "all" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Users
                    </label>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            if (assignType === "single") {
                              setSelectedUsers([user.id]);
                            } else {
                              toggleUserSelection(user.id);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUsers.includes(user.id)
                              ? "bg-blue-50 border-2 border-blue-500"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                          </div>
                          {selectedUsers.includes(user.id) && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                    {selectedUsers.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {selectedUsers.length} user(s) selected
                      </div>
                    )}
                  </div>
                )}

                {assignType === "all" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This will assign the coupon to all users in the system.
                      This action cannot be undone.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAssign}
                    disabled={
                      (assignType !== "all" && selectedUsers.length === 0) ||
                      assignCoupon.isPending ||
                      assignMultiple.isPending ||
                      assignAll.isPending
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {assignCoupon.isPending ||
                    assignMultiple.isPending ||
                    assignAll.isPending
                      ? "Assigning..."
                      : "Assign Coupon"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUsers([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCouponsPage;
