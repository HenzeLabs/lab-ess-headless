'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TabletOptimizedLayoutProps {
  featuredCollections?: Array<{
    id: string;
    title: string;
    handle: string;
    image?: { url: string; altText?: string };
  }>;
  featuredProducts?: Array<{
    id: string;
    title: string;
    handle: string;
    featuredImage?: { url: string; altText?: string };
    priceRange?: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  }>;
}

export default function TabletOptimizedLayout({
  featuredCollections = [],
  featuredProducts = []
}: TabletOptimizedLayoutProps) {
  return (
    <div className="tablet-optimized-layout">
      {/* Quick Navigation Cards - Above the Fold */}
      <section className="quick-nav-section md:block hidden lg:hidden px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Popular Categories - Interactive Cards */}
          <Link
            href="/collections/microscopes"
            className="nav-card group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative z-10">
              <h3 className="font-semibold text-lg mb-2">Microscopes</h3>
              <p className="text-sm text-gray-600">Professional lab equipment</p>
              <span className="inline-block mt-3 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                Explore →
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
          </Link>

          <Link
            href="/collections/centrifuges"
            className="nav-card group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative z-10">
              <h3 className="font-semibold text-lg mb-2">Centrifuges</h3>
              <p className="text-sm text-gray-600">High-speed separation</p>
              <span className="inline-block mt-3 text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                Browse →
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-200 rounded-full opacity-20"></div>
          </Link>

          <Link
            href="/collections/pipettes"
            className="nav-card group relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative z-10">
              <h3 className="font-semibold text-lg mb-2">Pipettes</h3>
              <p className="text-sm text-gray-600">Precision instruments</p>
              <span className="inline-block mt-3 text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                View All →
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-20"></div>
          </Link>
        </div>
      </section>

      {/* Interactive Product Carousel - Tablet Optimized */}
      <section className="product-carousel md:block hidden lg:hidden px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Equipment</h2>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        {/* Horizontal Scrollable Product Cards */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {featuredProducts.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="flex-shrink-0 w-64 group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  {product.featuredImage && (
                    <div className="relative aspect-square bg-gray-50">
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h3>
                    {product.priceRange && (
                      <p className="text-lg font-semibold text-green-600">
                        ${product.priceRange.minVariantPrice.amount}
                      </p>
                    )}
                    <button className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm">
                      Quick View
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Grid with Visual Interest */}
      <section className="collections-grid md:block hidden lg:hidden px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4">
          {featuredCollections.slice(0, 4).map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{collection.title}</h3>
                <span className="text-white/90 text-sm group-hover:translate-x-1 transition-transform inline-block">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="cta-section md:block hidden lg:hidden px-4 py-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Need Help Choosing?</h2>
          <p className="mb-4 opacity-90">Our experts are here to help you find the right equipment</p>
          <div className="flex gap-3">
            <Link
              href="/compare"
              className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
            >
              Compare Products
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-4 py-2 rounded font-medium hover:bg-white/10 transition-colors"
            >
              Contact Expert
            </Link>
          </div>
        </div>
      </section>

      {/* Scroll Indicator for Tablet */}
      <div className="scroll-indicator md:block hidden lg:hidden text-center py-4">
        <div className="inline-flex flex-col items-center animate-bounce">
          <span className="text-sm text-gray-500 mb-1">Scroll for more</span>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        .tablet-optimized-layout {
          min-height: auto;
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .quick-nav-section {
            position: sticky;
            top: 60px;
            background: white;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .product-carousel::-webkit-scrollbar {
            height: 6px;
          }

          .product-carousel::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }

          .product-carousel::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }

          .product-carousel::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        }
      `}</style>
    </div>
  );
}