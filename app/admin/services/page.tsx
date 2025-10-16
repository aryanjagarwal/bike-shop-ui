"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Package,
  FolderTree,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAllBookings, useAllServices } from "@/lib/api/admin/services";
import { useServiceCategories } from "@/lib/api/serviceBookings";
import BookingsTab from "@/components/admin/services/BookingsTab";
import CategoriesTab from "@/components/admin/services/CategoriesTab";
import ServicesTab from "@/components/admin/services/ServicesTab";

type TabType = "bookings" | "categories" | "services";

const AdminServicesPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("bookings");

  const tabs = [
    { id: "bookings" as TabType, label: "Bookings", icon: Calendar },
    { id: "categories" as TabType, label: "Categories", icon: FolderTree },
    { id: "services" as TabType, label: "Services", icon: Package },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Service Management</h1>
        <p className="text-gray-600">
          Manage service bookings, categories, and service offerings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "services" && <ServicesTab />}
      </motion.div>
    </div>
  );
};

export default AdminServicesPage;
