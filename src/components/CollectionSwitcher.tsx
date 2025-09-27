'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CollectionData, Product } from '@/lib/types';
import { textStyles, buttonStyles } from '@/lib/ui-safe';

const PRODUCT_FETCH_LIMIT = 12;

// Request deduplication cache
const requestCache = new Map<string, Promise<{ products?: Product[] }>>();

interface CollectionSwitcherProps {
  initialCollections: CollectionData[];
}

const CollectionSwitcher: React.FC<CollectionSwitcherProps> = ({
  initialCollections,
}) => {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCollectionChange = useCallback((handle: string) => {
    setActiveCollectionHandle(handle);
  }, []);

  const collectionTabs = useMemo(
    () =>
      initialCollections.map((collection) => {
        const isActive = activeCollectionHandle === collection.handle;
        return (
          <button
            type="button"
            key={collection.handle}
            onClick={() => handleCollectionChange(collection.handle)}
            className={`relative min-h-[48px] whitespace-nowrap rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4e2cfb] sm:text-base transform hover:scale-105
            ${
              isActive
                ? 'border-transparent bg-[#4e2cfb] text-white shadow-[0_12px_30px_-14px_rgba(72,45,226,0.9)] scale-105'
                : 'border-border/60 bg-white/85 text-[#4a4a67] hover:border-[#4e2cfb]/40 hover:bg-white hover:text-[#1f1f3a] hover:shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {collection.title}
            </span>
          </button>
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialCollections, activeCollectionHandle, handleCollectionChange],
  );

  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, clientWidth, scrollWidth } = container;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  const handleArrowClick = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const fetchProducts = useCallback(
    async (collectionHandle: string) => {
      if (!collectionHandle) {
        setProducts([]);
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }

      const cacheKey = `${collectionHandle}-${PRODUCT_FETCH_LIMIT}`;

      setLoading(true);
      try {
        // Check if we already have a pending request for this collection
        let responsePromise = requestCache.get(cacheKey);

        if (!responsePromise) {
          // Create new request and cache the promise
          responsePromise = fetch(
            `/api/collection-products?handle=${encodeURIComponent(
              collectionHandle,
            )}&first=${PRODUCT_FETCH_LIMIT}`,
          ).then(async (response) => {
            if (!response.ok) {
              throw new Error(`Request failed with ${response.status}`);
            }
            return response.json() as Promise<{ products?: Product[] }>;
          });

          requestCache.set(cacheKey, responsePromise);

          // Clear cache after 5 minutes to match server cache
          setTimeout(() => {
            requestCache.delete(cacheKey);
          }, 5 * 60 * 1000);
        }

        const { products: fetchedProducts = [] } = await responsePromise;
        setProducts(fetchedProducts);
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ left: 0 });
        }
        requestAnimationFrame(updateScrollButtons);
      } catch (error) {
        setProducts([]);
        // Remove failed request from cache
        requestCache.delete(cacheKey);
      } finally {
        setLoading(false);
      }
    },
    [updateScrollButtons],
  );

  useEffect(() => {
    fetchProducts(activeCollectionHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollectionHandle, fetchProducts]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    updateScrollButtons();

    container.addEventListener('scroll', updateScrollButtons, {
      passive: true,
    });
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, updateScrollButtons]);

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 lg:py-24 bg-background opacity-0 translate-y-8 transition-all duration-700 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`${textStyles.h2} text-foreground`}>
              Featured Collections
            </h2>
            <p className="text-muted-foreground mt-2">
              Discover our most popular lab equipment categories
            </p>
          </div>
          {isClient && products.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{products.length}</span>
              <span>of {PRODUCT_FETCH_LIMIT}+ products</span>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3 overflow-x-auto mb-8 pb-2">
          {collectionTabs}
        </div>

        {isClient && loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 sm:pb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="min-w-[260px] sm:min-w-[280px] flex-shrink-0 animate-pulse"
              >
                <div className="h-60 bg-gradient-to-br from-muted/40 to-muted/60 rounded-t-2xl mb-4"></div>
                <div className="space-y-3 px-5">
                  <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                  <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                  <div className="h-10 bg-muted/50 rounded-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {isClient && products.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => handleArrowClick('left')}
                  disabled={!canScrollLeft}
                  className="absolute left-[-1.5rem] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#4e2cfb] text-white shadow-[0_12px_30px_-14px_rgba(72,45,226,0.7)] transition hover:-translate-x-1 hover:bg-[#3f23d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground md:flex"
                >
                  <span className="sr-only">Scroll left</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    className="h-6 w-6"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleArrowClick('right')}
                  disabled={!canScrollRight}
                  className="absolute right-[-1.5rem] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#4e2cfb] text-white shadow-[0_12px_30px_-14px_rgba(72,45,226,0.7)] transition hover:translate-x-1 hover:bg-[#3f23d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground md:flex"
                >
                  <span className="sr-only">Scroll right</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    className="h-6 w-6"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </>
            )}
            <div
              ref={scrollContainerRef}
              className="relative flex gap-6 overflow-x-auto pb-4 sm:pb-6 scroll-smooth snap-x snap-mandatory"
            >
              {isClient && products.map((product) => (
                <div
                  key={product.id}
                  className="group flex min-w-[260px] max-w-[280px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#4e2cfb]/10"
                >
                  <Link href={`/products/${product.handle}`} className="block">
                    <div className="flex h-60 w-full items-center justify-center rounded-t-2xl bg-background p-6">
                      {product.featuredImage?.url ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          width={220}
                          height={220}
                          className="h-full w-auto object-contain drop-shadow-sm"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[hsl(var(--ink))] line-clamp-2 min-h-[3.5rem]">
                        {product.title}
                      </h3>
                    </div>
                    <p className="text-sm font-medium uppercase tracking-wide text-[hsl(var(--ink))]">
                      {product.priceRange.minVariantPrice.amount}{' '}
                      {product.priceRange.minVariantPrice.currencyCode}
                    </p>
                    <Link
                      href={`/products/${product.handle}`}
                      className={`${buttonStyles.primary} w-full mt-auto hover:scale-105 hover:shadow-[0_12px_28px_-8px_rgba(78,44,251,0.8)] transition-all duration-300`}
                    >
                      View product
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14" />
                        <path d="M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(CollectionSwitcher);
