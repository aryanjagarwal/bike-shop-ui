"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Bike,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Wrench,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== "admin")) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.publicMetadata?.role !== "admin") {
    return null;
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Bicycles",
      href: "/admin/bicycles",
      icon: Bike,
    },
    {
      name: "Parts",
      href: "/admin/parts",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Coupons",
      href: "/admin/coupons",
      icon: ShoppingCart,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Services",
      href: "/admin/services",
      icon: Wrench,
    },

    //{
    //  name: "Analytics",
    //  href: "/admin/analytics",
    //  icon: BarChart3,
    //},
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your bicycle shop</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-4 font-semibold whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
