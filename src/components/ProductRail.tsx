'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { buttonStyles, textStyles } from '@/lib/ui';

import type { Product } from '@/lib/types';

interface ProductRailProps {
  products: Product[];
  heading?: string;
  viewAllHref?: string;
}

const SCROLL_BUFFER = 8;

const ProductRail: React.FC<ProductRailProps> = ({
  heading,
  products,
  viewAllHref,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, clientWidth, scrollWidth } = container;
    setCanScrollLeft(scrollLeft > SCROLL_BUFFER);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - SCROLL_BUFFER);
  }, []);

  const handleArrow = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const distance = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    updateScrollButtons();
    const listener = () => updateScrollButtons();
    container.addEventListener('scroll', listener, { passive: true });

    return () => {
      container.removeEventListener('scroll', listener);
    };
  }, [products.length, updateScrollButtons]);

  if (!products.length) {
    return null;
  }

  return (
    <div className="relative">
      {heading || viewAllHref ? (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {heading ? (
            <h2 className={`${textStyles.h2} text-foreground`}>{heading}</h2>
          ) : null}
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand))] transition hover:text-[hsl(var(--brand-dark))]"
            >
              View all
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
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        <button
          type="button"
          onClick={() => handleArrow('left')}
          disabled={!canScrollLeft}
          className="absolute left-[-1.5rem] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#4e2cfb] text-white shadow-[0_12px_30px_-14px_rgba(72,45,226,0.7)] transition hover:-translate-x-1 hover:bg-[#3f23d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground md:flex"
        >
          <span className="sr-only">Scroll left</span>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleArrow('right')}
          disabled={!canScrollRight}
          className="absolute right-[-1.5rem] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#4e2cfb] text-white shadow-[0_12px_30px_-14px_rgba(72,45,226,0.7)] transition hover:translate-x-1 hover:bg-[#3f23d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground md:flex"
        >
          <span className="sr-only">Scroll right</span>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="relative flex gap-6 overflow-x-auto pb-4 sm:pb-6 scroll-smooth snap-x snap-mandatory"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="group flex min-w-[260px] max-w-[280px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                href={`/products/${product.handle}`}
                className="block"
                tabIndex={-1}
              >
                <div className="flex h-60 w-full items-center justify-center rounded-t-2xl bg-background p-6">
                  {product.featuredImage?.url ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      width={240}
                      height={240}
                      className="h-full w-auto object-contain drop-shadow-sm transition duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-sm text-[hsl(var(--muted-foreground))]">
                      No image available
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[hsl(var(--ink))] line-clamp-2 min-h-[3.5rem]">
                    <Link
                      href={`/products/${product.handle}`}
                      className="transition hover:text-[hsl(var(--brand))]"
                    >
                      {product.title}
                    </Link>
                  </h3>
                </div>
                <p className="text-sm font-medium uppercase tracking-wide text-[hsl(var(--ink))]">
                  {product.priceRange.minVariantPrice.amount}{' '}
                  {product.priceRange.minVariantPrice.currencyCode}
                </p>
                <Link
                  href={`/products/${product.handle}`}
                  className={`${buttonStyles.primary} w-full text-white mt-auto`}
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
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductRail;
