"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Bike,
  Wrench,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAdminOrders } from "@/lib/api/admin/orders";
import { useAdminUsers } from "@/lib/api/admin/users";
import { useAllBicycles } from "@/lib/api/bicycles";
import { useAllParts } from "@/lib/api/parts";
import { OrderStatus, UserRole, BicycleCategory } from "@/lib/types/allTypes";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Fetch data
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({
    page: 1,
    limit: 1000,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({
    page: 1,
    limit: 1000,
  });
  const { data: bicyclesData, isLoading: bicyclesLoading } = useAllBicycles({
    page: 1,
    limit: 1000,
  });
  const { data: partsData, isLoading: partsLoading } = useAllParts({
    page: 1,
    limit: 1000,
  });

  const isLoading = ordersLoading || usersLoading || bicyclesLoading || partsLoading;

  const orders = ordersData?.data || [];
  const users = usersData?.data || [];
  const bicycles = bicyclesData?.data || [];
  const parts = partsData?.data || [];

  console.log("orders", orders);
  console.log("users", users);
  console.log("bicycles", bicycles);
  console.log("parts", parts);

  // Calculate analytics
  const analytics = useMemo(() => {
    // Revenue by status
    const revenueByStatus = {
      delivered: orders
        .filter((o) => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + o.summary.total, 0),
      pending: orders
        .filter((o) => o.status === OrderStatus.PENDING)
        .reduce((sum, o) => sum + o.summary.total, 0),
      processing: orders
        .filter((o) => o.status === OrderStatus.PROCESSING)
        .reduce((sum, o) => sum + o.summary.total, 0),
      shipped: orders
        .filter((o) => o.status === OrderStatus.SHIPPED)
        .reduce((sum, o) => sum + o.summary.total, 0),
      cancelled: orders
        .filter((o) => o.status === OrderStatus.CANCELLED)
        .reduce((sum, o) => sum + o.summary.total, 0),
    };

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
      confirmed: orders.filter((o) => o.status === OrderStatus.CONFIRMED).length,
      processing: orders.filter((o) => o.status === OrderStatus.PROCESSING).length,
      shipped: orders.filter((o) => o.status === OrderStatus.SHIPPED).length,
      delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED).length,
      cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      refunded: orders.filter((o) => o.status === OrderStatus.REFUNDED).length,
    };

    // Users by role
    const usersByRole = {
      customers: users.filter((u) => u.role === UserRole.CUSTOMER).length,
      admins: users.filter((u) => u.role === UserRole.ADMIN).length,
      technicians: users.filter((u) => u.role === UserRole.TECHNICIAN).length,
    };

    // Bicycles by category
    const bicyclesByCategory: Record<string, number> = {};
    bicycles.forEach((b) => {
      bicyclesByCategory[b.category] = (bicyclesByCategory[b.category] || 0) + 1;
    });

    // Top selling items (by order count)
    const itemSales: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.bicycle) {
          const key = item.bicycle.id;
          if (!itemSales[key]) {
            itemSales[key] = { name: item.bicycle.name, count: 0, revenue: 0 };
          }
          itemSales[key].count += item.quantity;
          itemSales[key].revenue += parseFloat(item.totalPrice);
        }
        if (item.part) {
          const key = item.part.id;
          if (!itemSales[key]) {
            itemSales[key] = { name: item.part.name, count: 0, revenue: 0 };
          }
          itemSales[key].count += item.quantity;
          itemSales[key].revenue += parseFloat(item.totalPrice);
        }
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Inventory value
    const bicycleInventoryValue = bicycles.reduce(
      (sum, b) => sum + parseFloat(b.price) * b.stockQuantity,
      0
    );
    const partsInventoryValue = parts.reduce(
      (sum, p) => sum + parseFloat(p.price) * p.stockQuantity,
      0
    );

    // Average order value
    const avgOrderValue =
      orders.length > 0
        ? orders.reduce((sum, o) => sum + o.summary.total, 0) / orders.length
        : 0;

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      if (order.status === OrderStatus.DELIVERED) {
        monthlyRevenue[monthKey] += order.summary.total;
      }
    });

    const sortedMonths = Object.keys(monthlyRevenue).sort().slice(-6);
    const monthlyTrend = sortedMonths.map((month) => ({
      month,
      revenue: monthlyRevenue[month],
    }));

    return {
      revenueByStatus,
      ordersByStatus,
      usersByRole,
      bicyclesByCategory,
      topSellingItems,
      bicycleInventoryValue,
      partsInventoryValue,
      avgOrderValue,
      monthlyTrend,
      totalRevenue: revenueByStatus.delivered,
      totalOrders: orders.length,
      totalUsers: users.length,
    };
  }, [orders, users, bicycles, parts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics & Insights
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive business analytics and metrics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-green-700 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-900">£{analytics.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-2">From {analytics.ordersByStatus.delivered} delivered orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-blue-700 text-sm font-medium mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-900">{analytics.totalOrders}</p>
          <p className="text-xs text-blue-600 mt-2">Avg: £{analytics.avgOrderValue.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-purple-700 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-purple-900">{analytics.totalUsers}</p>
          <p className="text-xs text-purple-600 mt-2">{analytics.usersByRole.customers} customers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm p-6 border border-orange-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-orange-700 text-sm font-medium mb-1">Inventory Value</h3>
          <p className="text-3xl font-bold text-orange-900">
            £{(analytics.bicycleInventoryValue + analytics.partsInventoryValue).toFixed(0)}
          </p>
          <p className="text-xs text-orange-600 mt-2">
            {bicycles.length} bikes, {parts.length} parts
          </p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Orders by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
              const total = analytics.totalOrders;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors: Record<string, string> = {
                pending: "bg-yellow-500",
                confirmed: "bg-blue-500",
                processing: "bg-indigo-500",
                shipped: "bg-purple-500",
                delivered: "bg-green-500",
                cancelled: "bg-red-500",
                refunded: "bg-gray-500",
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[status]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Revenue by Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Revenue by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.revenueByStatus).map(([status, revenue]) => {
              const total = Object.values(analytics.revenueByStatus).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (revenue / total) * 100 : 0;
              const colors: Record<string, string> = {
                delivered: "bg-green-500",
                pending: "bg-yellow-500",
                processing: "bg-blue-500",
                shipped: "bg-purple-500",
                cancelled: "bg-red-500",
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                    <span className="text-sm font-bold text-gray-900">
                      £{revenue.toFixed(2)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[status]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Users by Role
          </h2>
          <div className="space-y-4">
            {Object.entries(analytics.usersByRole).map(([role, count]) => {
              const percentage = analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0;
              const colors: Record<string, string> = {
                customers: "bg-blue-500",
                admins: "bg-purple-500",
                technicians: "bg-green-500",
              };
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[role]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bicycles by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bike className="w-5 h-5 text-blue-600" />
            Bicycles by Category
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.bicyclesByCategory).map(([category, count]) => {
              const total = bicycles.length;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Top Selling Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topSellingItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No sales data available
                  </td>
                </tr>
              ) : (
                analytics.topSellingItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-gray-600">{item.count} units</td>
                    <td className="py-3 px-4 font-bold text-green-600">£{item.revenue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Monthly Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Monthly Revenue Trend (Last 6 Months)
        </h2>
        {analytics.monthlyTrend.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No revenue data available</p>
        ) : (
          <div className="space-y-4">
            {analytics.monthlyTrend.map((month) => {
              const maxRevenue = Math.max(...analytics.monthlyTrend.map((m) => m.revenue));
              const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm font-bold text-gray-900">£{month.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
