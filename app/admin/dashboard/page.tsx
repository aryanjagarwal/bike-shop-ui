"use client";

import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Users,
  Bike,
  Wrench,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAdminOrders } from "@/lib/api/admin/orders";
import { useAdminUsers } from "@/lib/api/admin/users";
import { useAllBicycles } from "@/lib/api/bicycles";
import { useAllParts } from "@/lib/api/parts";
import { useGetAllCoupons } from "@/lib/api/admin/coupons";
import { formatOrderStatus, getOrderStatusColor } from "@/lib/api/orders";
import { OrderStatus } from "@/lib/types/allTypes";

export default function AdminDashboardPage() {
  // Fetch data from APIs
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders(
    { page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(
    { page: 1, limit: 1 }
  );
  const { data: bicyclesData, isLoading: bicyclesLoading } = useAllBicycles(
    { page: 1, limit: 100 }
  );
  const { data: partsData, isLoading: partsLoading } = useAllParts(
    { page: 1, limit: 100 }
  );
  const { data: couponsData, isLoading: couponsLoading } = useGetAllCoupons();

  const isLoading = ordersLoading || usersLoading || bicyclesLoading || partsLoading || couponsLoading;

  // Calculate statistics
  const orders = ordersData?.data || [];
  const totalOrders = ordersData?.pagination?.total || 0;
  const totalUsers = usersData?.pagination?.total || 0;
  const bicycles = bicyclesData?.data || [];
  const parts = partsData?.data || [];
  const coupons = couponsData?.data || [];

  // Calculate total revenue from delivered orders
  const totalRevenue = orders
    .filter(order => order.status === OrderStatus.DELIVERED)
    .reduce((sum, order) => sum + order.summary.total, 0);

  // Count low stock items (stock < 10)
  const lowStockBicycles = bicycles.filter(b => b.stockQuantity < 10).length;
  const lowStockParts = parts.filter(p => p.stockQuantity < 10).length;
  const lowStockItems = lowStockBicycles + lowStockParts;

  // Count pending orders
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;

  // Count active coupons
  const activeCoupons = coupons.filter((c) => c.isActive).length;

  const stats = [
    {
      title: "Total Revenue",
      value: `£${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      description: "From delivered orders",
      link: "/admin/orders?status=DELIVERED",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      description: `${pendingOrders} pending`,
      link: "/admin/orders",
    },
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      description: "Registered users",
      link: "/admin/users",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
      description: "Items below 10 units",
      link: "/admin/bicycles",
    },
  ];

  const inventoryStats = [
    {
      title: "Bicycles",
      value: bicycles.length.toString(),
      icon: Bike,
      color: "text-blue-600",
      lowStock: lowStockBicycles,
      link: "/admin/bicycles",
    },
    {
      title: "Parts",
      value: parts.length.toString(),
      icon: Wrench,
      color: "text-orange-600",
      lowStock: lowStockParts,
      link: "/admin/parts",
    },
    {
      title: "Active Coupons",
      value: activeCoupons.toString(),
      icon: Tag,
      color: "text-green-600",
      total: coupons.length,
      link: "/admin/coupons",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your bicycle shop</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={stat.title} href={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Inventory Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Inventory Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inventoryStats.map((stat, index) => (
            <Link key={stat.title} href={stat.link}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                {stat.lowStock !== undefined && stat.lowStock > 0 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {stat.lowStock} low stock
                  </p>
                )}
                {stat.total !== undefined && (
                  <p className="text-xs text-gray-500">Total: {stat.total}</p>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Order Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {order.user.firstName} {order.user.lastName}
                        </div>
                        <div className="text-gray-500 text-xs">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      £{order.summary.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
