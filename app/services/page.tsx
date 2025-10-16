"use client";

import { motion } from "framer-motion";
import { Clock, Award, Package, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useServiceCategories } from "@/lib/api/serviceBookings";
import ServiceCategoryCard from "@/components/services/ServiceCategoryCard";
import Link from "next/link";

export default function ServicesPage() {
  const { data: categoriesResponse, isLoading, error } = useServiceCategories();

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop"
          alt="Services"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl">
              Professional cycling services to keep you riding at your best
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Our Service Categories</h2>
          <p className="text-gray-600 text-lg">
            Browse our professional bicycle services and book an appointment
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load services</h3>
            <p className="text-gray-600">Please try again later</p>
          </div>
        )}

        {/* Categories Grid */}
        {categoriesResponse?.data && categoriesResponse.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesResponse.data.map((category, index) => (
              <ServiceCategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {categoriesResponse?.data && categoriesResponse.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No services available at the moment</p>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose BikeShop?</h2>
            <p className="text-gray-600 text-lg">
              We&apos;re committed to providing the best service in the industry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">
                Most repairs completed within 24-48 hours
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Technicians</h3>
              <p className="text-gray-600">
                Certified mechanics with years of experience
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Parts</h3>
              <p className="text-gray-600">
                Only genuine and premium quality components used
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Book your service appointment today or visit our shop
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/account/bookings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View My Bookings
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
