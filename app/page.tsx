"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Truck, Star, Award, Zap, Mountain, Bike, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import BicycleCard from "@/components/BicycleCard";
import { useFeaturedBicycles } from "@/lib/api/bicycles";
import { useState, useEffect } from "react";

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured);
  const { data: featuredBicyclesData, isLoading: bicyclesLoading } = useFeaturedBicycles(8);
  
  // Hero carousel data
  const heroTitlesSubTitlesAndImages = [
    {
      title: "Ride Your Dream",
      subtitle: "Discover premium bicycles and parts for every adventure. Quality, performance, and style combined.",
      image: "/hero-images/im1.jpg"
    },
    {
      title: "Adventure Awaits",
      subtitle: "Explore the world on two wheels. From mountain trails to city streets, find your perfect ride.",
      image: "/hero-images/im2.jpg"
    },
    {
      title: "Performance Meets Style",
      subtitle: "Experience cutting-edge engineering and stunning design. Built for riders who demand excellence.",
      image: "/hero-images/im3.jpg"
    },
    {
      title: "Unleash Your Potential",
      subtitle: "Push your limits with bikes designed for speed, endurance, and ultimate performance.",
      image: "/hero-images/im4.jpg"
    },
    {
      title: "Every Journey Starts Here",
      subtitle: "Whether commuting or conquering trails, we have the perfect bicycle for your lifestyle.",
      image: "/hero-images/im5.jpg"
    },
    {
      title: "Built for Champions",
      subtitle: "Professional-grade bicycles and components trusted by athletes worldwide.",
      image: "/hero-images/im6.jpg"
    },
    {
      title: "Ride with Confidence",
      subtitle: "Premium quality, expert service, and comprehensive warranties on every purchase.",
      image: "/hero-images/im7.jpg"
    },
    {
      title: "Transform Your Commute",
      subtitle: "Eco-friendly, efficient, and stylish. Make every ride an experience to remember.",
      image: "/hero-images/im8.jpg"
    },
    {
      title: "Join the Revolution",
      subtitle: "Embrace the cycling lifestyle with our curated collection of bikes and accessories.",
      image: "/hero-images/im9.jpg"
    }
  ]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroTitlesSubTitlesAndImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [heroTitlesSubTitlesAndImages.length]);

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentImageIndex}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroTitlesSubTitlesAndImages[currentImageIndex].image}
                alt={heroTitlesSubTitlesAndImages[currentImageIndex].title}
                fill
                className="object-cover"
                priority={currentImageIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <motion.h1
              key={`title-${currentImageIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              {heroTitlesSubTitlesAndImages[currentImageIndex].title}
            </motion.h1>
            <motion.p
              key={`subtitle-${currentImageIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl mb-8 text-gray-200"
            >
              {heroTitlesSubTitlesAndImages[currentImageIndex].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/shop/bicycles">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Shop Bicycles
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/shop/parts">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  Shop Parts
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl blur-2xl opacity-20" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&h=1000&fit=crop"
                  alt="Premium Bicycle"
                  width={800}
                  height={1000}
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Premium Quality Bikes</h3>
                  <p className="text-white/90">Crafted for performance and durability</p>
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4.9</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold mb-4"
                >
                  <Zap className="w-4 h-4" />
                  <span>Why Choose Us</span>
                </motion.div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Experience the
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    BikeShop Difference
                  </span>
                </h2>
                <p className="text-gray-600 text-lg">
                  We're committed to providing premium bicycles and exceptional service to cycling enthusiasts worldwide.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Free Shipping</h3>
                    <p className="text-gray-600">
                      Enjoy free delivery on all orders over £500. Fast and reliable shipping to your doorstep nationwide.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Warranty Protection</h3>
                    <p className="text-gray-600">
                      All products come with a comprehensive 2-year warranty for your complete peace of mind.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Expert Support</h3>
                    <p className="text-gray-600">
                      Get professional cycling advice from our team of experienced specialists available 24/7.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/shop/bicycles">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    Explore Our Collection
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Bicycles */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold mb-4"
            >
              <Star className="w-4 h-4 fill-blue-600" />
              <span>Featured Collection</span>
            </motion.div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Premium Bicycles
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Handpicked selection of our best bicycles, trusted by thousands of riders
            </p>
          </motion.div>

          {/* Loading State */}
          {bicyclesLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          )}

          {/* Bicycles Grid */}
          {!bicyclesLoading && featuredBicyclesData?.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredBicyclesData.data.map((bicycle, index) => (
                <motion.div
                  key={bicycle.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BicycleCard bicycle={bicycle} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!bicyclesLoading && (!featuredBicyclesData?.data || featuredBicyclesData.data.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured bicycles available at the moment.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/shop/bicycles">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                View All Bicycles
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold mb-4"
            >
              <Bike className="w-4 h-4" />
              <span>Categories</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find the perfect bike for your riding style and adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                name: "Mountain Bikes", 
                description: "Conquer any terrain",
                image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600&h=400&fit=crop",
                count: "45+ Models"
              },
              { 
                name: "Road Bikes", 
                description: "Speed and performance",
                image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop",
                count: "38+ Models"
              },
              { 
                name: "Electric Bikes", 
                description: "Effortless riding",
                image: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=600&h=400&fit=crop",
                count: "28+ Models"
              },
              { 
                name: "City Bikes", 
                description: "Urban commuting",
                image: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600&h=400&fit=crop",
                count: "32+ Models"
              },
              { 
                name: "BMX Bikes", 
                description: "Tricks and stunts",
                image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&h=400&fit=crop",
                count: "22+ Models"
              },
              { 
                name: "Kids Bikes", 
                description: "Safe and fun",
                image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=600&h=400&fit=crop",
                count: "35+ Models"
              }
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/shop/bicycles?category=${category.name}`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer h-full"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                        {category.count}
                      </div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-bold text-2xl mb-1 group-hover:text-blue-300 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-sm mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Explore Collection</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-16 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-blue-100 text-sm md:text-base">Happy Riders</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-blue-100 text-sm md:text-base">Products</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">4.9★</div>
                <div className="text-blue-100 text-sm md:text-base">Rating</div>
              </motion.div>
            </div>

            {/* CTA Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to Start Your<br />Cycling Journey?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
                Join thousands of satisfied cyclists who trust BikeShop for quality and performance
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/shop/bicycles">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-3"
                  >
                    Start Shopping
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/shop/parts">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                  >
                    Browse Parts
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl" />
      </section>
    </div>
  );
}
