"use client";

import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      trend: "+12.5%",
    },
    {
      title: "Total Orders",
      value: "156",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      trend: "+8.2%",
    },
    {
      title: "Total Bicycles",
      value: "48",
      icon: Package,
      color: "bg-purple-100 text-purple-600",
      trend: "+3.1%",
    },
    {
      title: "Low Stock Items",
      value: "5",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
      trend: "-2.4%",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", date: "2025-10-12", status: "Completed", total: "$1,150" },
    { id: "ORD-002", date: "2025-10-12", status: "Processing", total: "$2,400" },
    { id: "ORD-003", date: "2025-10-11", status: "Completed", total: "$890" },
    { id: "ORD-004", date: "2025-10-11", status: "Pending", total: "$1,650" },
    { id: "ORD-005", date: "2025-10-10", status: "Completed", total: "$3,200" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-green-600">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{order.id}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
