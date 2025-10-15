'use client';

import React from 'react';

// Base skeleton component
const Skeleton = React.memo<{
  className?: string;
  'data-testid'?: string;
}>(({ className = '', 'data-testid': testId }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    data-testid={testId}
    role="status"
    aria-label="Loading..."
  />
));

Skeleton.displayName = 'Skeleton';

// Product Card Skeleton
export const ProductCardSkeleton = React.memo(() => (
  <div
    className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
    data-testid="product-card-skeleton"
  >
    {/* Image skeleton */}
    <div className="flex h-60 w-full items-center justify-center rounded-t-2xl bg-background p-6">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>

    {/* Content skeleton */}
    <div className="p-5 pt-3 flex-grow">
      {/* Title */}
      <Skeleton className="h-6 w-3/4 mb-2" />

      {/* Brand/Model badges */}
      <div className="mt-1 flex flex-wrap gap-2 mb-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Features */}
      <div className="mb-3">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Availability */}
      <Skeleton className="h-6 w-24 mb-4" />
    </div>

    {/* Price */}
    <div className="px-5 pb-3">
      <Skeleton className="h-6 w-20" />
    </div>

    {/* Button */}
    <div className="px-5 pb-5">
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

// Product Rail Skeleton
export const ProductRailSkeleton = React.memo(() => (
  <div className="py-8" data-testid="product-rail-skeleton">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-20" />
    </div>

    {/* Products grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  </div>
));

ProductRailSkeleton.displayName = 'ProductRailSkeleton';

// Collection Grid Skeleton
export const CollectionGridSkeleton = React.memo(() => (
  <div
    className="flex flex-col lg:flex-row gap-6"
    data-testid="collection-grid-skeleton"
  >
    {/* Filters Sidebar Skeleton */}
    <div className="w-full lg:w-72 lg:flex-shrink-0 space-y-6">
      <div>
        <Skeleton className="h-6 w-20 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-6 w-24 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-16 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>

    {/* Products Grid Skeleton */}
    <div className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
));

CollectionGridSkeleton.displayName = 'CollectionGridSkeleton';

// Hero Product Skeleton
export const HeroProductSkeleton = React.memo(() => (
  <section className="relative isolate overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-20 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Content side */}
        <div className="relative z-10 text-center lg:text-left">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <div className="space-y-2 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>

        {/* Product image side */}
        <div className="relative z-10">
          <div className="group relative overflow-hidden rounded-[28px] bg-white shadow-lg">
            <Skeleton className="w-full h-96" />
          </div>
        </div>
      </div>
    </div>
  </section>
));

HeroProductSkeleton.displayName = 'HeroProductSkeleton';

export default Skeleton;
