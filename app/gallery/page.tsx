"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&h=600&fit=crop",
      title: "Road Cycling",
      category: "Action",
    },
    {
      url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&h=600&fit=crop",
      title: "Mountain Biking",
      category: "Adventure",
    },
    {
      url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop",
      title: "City Commute",
      category: "Urban",
    },
    {
      url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&h=600&fit=crop",
      title: "Racing",
      category: "Sport",
    },
    {
      url: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&h=600&fit=crop",
      title: "Trail Riding",
      category: "Adventure",
    },
    {
      url: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=600&fit=crop",
      title: "Vintage Bikes",
      category: "Classic",
    },
    {
      url: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=800&h=600&fit=crop",
      title: "E-Bikes",
      category: "Technology",
    },
    {
      url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
      title: "Electric Commuting",
      category: "Urban",
    },
    {
      url: "https://images.unsplash.com/photo-1519583272095-6433daf26b6e?w=800&h=600&fit=crop",
      title: "Kids Cycling",
      category: "Family",
    },
    {
      url: "https://images.unsplash.com/photo-1475666675596-cca2035b3d79?w=800&h=600&fit=crop",
      title: "BMX Tricks",
      category: "Extreme",
    },
    {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      title: "Bike Workshop",
      category: "Service",
    },
    {
      url: "https://images.unsplash.com/photo-1571380401583-72ca84994796?w=800&h=600&fit=crop",
      title: "Night Riding",
      category: "Adventure",
    },
  ];

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-gray-600 text-lg">
            Explore our collection of cycling moments and adventures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedImage(image.url)}
              className="relative h-64 bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg">{image.title}</h3>
                  <p className="text-sm">{image.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-4xl h-[80vh]">
              <Image
                src={selectedImage}
                alt="Gallery image"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
