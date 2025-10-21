'use client';

import { useEffect, useState } from 'react';

/**
 * Deferred Hydration Component
 * Delays client-side hydration until browser is idle
 * Reduces TTI and improves INP for below-fold content
 */

type DeferredHydrationProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Delay in ms before hydrating (default: uses requestIdleCallback) */
  delay?: number;
  /** Hydrate on scroll into view (default: false) */
  hydrateOnView?: boolean;
};

export default function DeferredHydration({
  children,
  fallback = null,
  delay,
  hydrateOnView = false,
}: DeferredHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (hydrateOnView) {
      // Hydrate when scrolled into view
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setIsHydrated(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }, // Hydrate 200px before entering viewport
      );

      const element = document.getElementById('deferred-hydration');
      if (element) observer.observe(element);

      return () => observer.disconnect();
    } else {
      // Hydrate after idle callback or delay
      if (delay) {
        const timeout = setTimeout(() => setIsHydrated(true), delay);
        return () => clearTimeout(timeout);
      } else if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(() => setIsHydrated(true));
        return () => cancelIdleCallback(id);
      } else {
        // Fallback for browsers without requestIdleCallback
        const timeout = setTimeout(() => setIsHydrated(true), 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [delay, hydrateOnView]);

  if (!isHydrated) {
    return <div id="deferred-hydration">{fallback}</div>;
  }

  return <>{children}</>;
}

/**
 * Usage Example:
 *
 * // Product Reviews (below fold)
 * <DeferredHydration hydrateOnView fallback={<ReviewsSkeleton />}>
 *   <ProductReviews productId={product.id} />
 * </DeferredHydration>
 *
 * // Related Products (below fold)
 * <DeferredHydration delay={2000} fallback={<ProductGridSkeleton />}>
 *   <RelatedProducts category={product.category} />
 * </DeferredHydration>
 *
 * // Email Signup (bottom of page)
 * <DeferredHydration hydrateOnView>
 *   <EmailSignupForm />
 * </DeferredHydration>
 */
