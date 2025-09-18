'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';

import { buttonStyles, layout, textStyles } from '@/lib/ui';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  image: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  colors?: string[];
}

interface FeaturedProductsProps {
  products?: Product[];
  title?: string;
}

const ProductSkeleton = () => (
  <div className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--muted))]/20 bg-[hsl(var(--bg))] shadow-sm animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))]/40 to-[hsl(var(--muted))]/20" />
    <div className="p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-[hsl(var(--muted))]/40" />
        <div className="h-4 w-12 rounded bg-[hsl(var(--muted))]/40" />
      </div>
      <div className="mb-2 h-6 rounded bg-[hsl(var(--muted))]/40" />
      <div className="mb-4 h-4 w-3/4 rounded bg-[hsl(var(--muted))]/40" />
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-20 rounded bg-[hsl(var(--muted))]/40" />
        <div className="h-4 w-16 rounded bg-[hsl(var(--muted))]/40" />
      </div>
      <div className="h-12 rounded-full bg-[hsl(var(--muted))]/40" />
    </div>
  </div>
);

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  title = "Featured Products",
  products = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-5');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    productRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [products]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'fill-[hsl(var(--brand))] text-[hsl(var(--brand))]'
                : 'fill-[hsl(var(--muted))] text-[hsl(var(--muted))]'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section ref={containerRef} className="bg-[hsl(var(--bg))]">
      <div className={`${layout.container} ${layout.section}`}>
        <h2 className={`${textStyles.heading} mb-12 text-center`}>
          {title}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0 ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                ref={(el) => { productRefs.current[index] = el; }}
                className="opacity-0 duration-700"
              >
                <div className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--muted))]/20 bg-[hsl(var(--bg))] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded-full bg-[hsl(var(--brand))] px-3 py-1 text-xs font-bold text-[hsl(var(--bg))]">
                {product.badge}
              </span>
            </div>
          )}

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-[hsl(var(--border))] bg-surface/90 p-2 text-heading shadow-subtle transition hover:bg-surface"
                        aria-label="Add to favorites"
                      >
                        <HeartIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-[hsl(var(--border))] bg-surface/90 p-2 text-heading shadow-subtle transition hover:bg-surface"
                        aria-label="Quick view"
                      >
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Product Image */}
                  <Link href={`/products/${product.handle}`}>
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))]/20 to-[hsl(var(--muted))]/10">
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    {/* Rating */}
                    <div className="mb-3 flex items-center gap-2">
                      {product.rating && renderStars(Math.floor(product.rating))}
                      {product.reviews && (
                        <span className="text-sm text-[hsl(var(--muted))]">
                          ({product.reviews} reviews)
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/products/${product.handle}`}>
                      <h3 className="text-lg font-semibold text-[hsl(var(--ink))] mb-2 line-clamp-2 transition-colors group-hover:text-[hsl(var(--brand))]">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {/* Colors */}
                    {product.colors && (
                      <div className="mb-3 flex gap-2">
                        {product.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="h-5 w-5 cursor-pointer rounded-full border-2 border-[hsl(var(--bg))] shadow-md ring-1 ring-[hsl(var(--muted))]/40 transition-all hover:ring-[hsl(var(--brand))]"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[hsl(var(--ink))]">
                          {product.price}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-[hsl(var(--muted))] line-through">
                            {product.compareAtPrice}
                          </span>
                        )}
                      </div>
                      {product.compareAtPrice && (
                        <span className="rounded-full bg-[hsl(var(--brand))]/10 px-2 py-1 text-sm font-medium text-[hsl(var(--brand))]">
                          Save {Math.round(((parseFloat(product.compareAtPrice.replace('$', '')) - parseFloat(product.price.replace('$', ''))) / parseFloat(product.compareAtPrice.replace('$', ''))) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      className={`${buttonStyles.primary} w-full rounded-xl py-3 transition-transform duration-300 hover:scale-[1.02] active:scale-95 group-hover:shadow-lift`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
