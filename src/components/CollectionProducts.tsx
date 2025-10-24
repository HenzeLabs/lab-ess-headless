'use client';

import React, { useState, useMemo } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import CollectionFilters from '@/components/CollectionFilters';

interface CollectionProductsProps {
  products: Product[];
  collectionTitle: string;
}

export default function CollectionProducts({
  products,
  collectionTitle: _collectionTitle,
}: CollectionProductsProps) {
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    if (priceRange.min !== null || priceRange.max !== null) {
      filtered = filtered.filter((product) => {
        if (!product.priceRange?.minVariantPrice?.amount) return false;
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        if (priceRange.min !== null && price < priceRange.min) return false;
        if (priceRange.max !== null && price > priceRange.max) return false;
        return true;
      });
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0')
          );
        case 'price-desc':
          return (
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0')
          );
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'featured':
        default:
          return 0; // Keep original order
      }
    });

    return sorted;
  }, [products, sortBy, priceRange]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-56 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-24">
          <CollectionFilters
            onSortChange={setSortBy}
            onPriceRangeChange={(min: number | null, max: number | null) =>
              setPriceRange({ min, max })
            }
            currentSort={sortBy}
            currentPriceRange={priceRange}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No products found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or price range
            </p>
          </div>
        ) : (
          <>
            {/* Product Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedProducts.length} product
                {filteredAndSortedProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
