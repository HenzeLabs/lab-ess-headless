'use client';

import { useEffect, useState } from 'react';
import { Filter, Grid } from 'lucide-react';

interface StickyCollectionCTAProps {
  collectionTitle: string;
  productCount?: number;
  showAfterScroll?: number;
  onFilterClick?: () => void;
  onSortClick?: () => void;
}

export default function StickyCollectionCTA({
  collectionTitle,
  productCount,
  showAfterScroll = 400,
  onFilterClick,
  onSortClick,
}: StickyCollectionCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > showAfterScroll);
    };

    // Check scroll position on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="complementary"
      aria-label="Collection navigation"
    >
      <div className="bg-[hsl(var(--brand))] shadow-2xl border-t-2 border-[hsl(var(--brand-dark))]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Collection Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm md:text-base truncate">
                {collectionTitle}
              </p>
              {productCount !== undefined && (
                <p className="text-white/90 text-xs md:text-sm">
                  {productCount} {productCount === 1 ? 'product' : 'products'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onFilterClick && (
                <button
                  onClick={onFilterClick}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 px-4 py-2 md:px-5 md:py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--brand))]"
                  aria-label="Filter products"
                >
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              )}

              {onSortClick && (
                <button
                  onClick={onSortClick}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 md:px-5 md:py-3 text-sm font-bold text-[hsl(var(--brand))] shadow-lg transition-all hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--brand))]"
                  aria-label="View products grid"
                >
                  <Grid className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">View All</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
