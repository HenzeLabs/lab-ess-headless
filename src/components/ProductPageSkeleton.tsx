/**
 * Product Page Skeleton Loader
 * Shows instant layout to reduce perceived load time
 * Target: < 100ms to first paint
 */

export default function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          {/* Thumbnail strip */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-10 bg-gray-200 rounded-lg w-1/2" />
          </div>

          {/* Price */}
          <div className="h-8 bg-gray-200 rounded-lg w-1/4" />

          {/* Stock status */}
          <div className="h-6 bg-gray-200 rounded-lg w-1/3" />

          {/* Variant selector */}
          <div className="h-12 bg-gray-200 rounded-xl w-full" />

          {/* Add to Cart button */}
          <div className="h-14 bg-gray-300 rounded-xl w-full" />

          {/* Features list */}
          <div className="space-y-3 pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded-full" />
                <div className="h-5 bg-gray-200 rounded w-full max-w-xs" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="mt-12 space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-1/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Usage in product/[handle]/page.tsx:
 *
 * import { Suspense } from 'react';
 * import ProductPageSkeleton from '@/components/ProductPageSkeleton';
 *
 * export default async function ProductPage({ params }) {
 *   return (
 *     <Suspense fallback={<ProductPageSkeleton />}>
 *       <ProductPageContent handle={params.handle} />
 *     </Suspense>
 *   );
 * }
 */
