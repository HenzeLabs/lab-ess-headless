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
  collectionTitle,
}: CollectionProductsProps) {
  const [sortBy, setSortBy] = useState<string>('featured');
  const [availability, setAvailability] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });

  // Extract available brands from products metafields
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((product) => {
      if (!product.metafields || !Array.isArray(product.metafields)) {
        return;
      }
      // Filter out null/undefined entries before processing
      const validMetafields = product.metafields.filter(Boolean);
      const brandMetafield = validMetafields.find(
        (field) => field.key === 'brand',
      );
      if (brandMetafield?.value) {
        brandSet.add(brandMetafield.value);
      }
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by availability - we'll skip this filter since availability info isn't in the Product type
    // This would need to be implemented with additional product data from Shopify
    if (availability !== 'all') {
      // For now, we'll just show all products regardless of availability filter
      // In a real implementation, you'd need to fetch variant availability data
    }

    // Filter by brands
    if (brands.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.metafields || !Array.isArray(product.metafields)) {
          return false;
        }
        // Filter out null/undefined entries before processing
        const validMetafields = product.metafields.filter(Boolean);
        const brandMetafield = validMetafields.find(
          (field) => field.key === 'brand',
        );
        return brandMetafield?.value && brands.includes(brandMetafield.value);
      });
    }

    // Filter by price range
    if (priceRange.min !== null || priceRange.max !== null) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(
          product.priceRange?.minVariantPrice?.amount || '0',
        );
        const minOk = priceRange.min === null || price >= priceRange.min;
        const maxOk = priceRange.max === null || price <= priceRange.max;
        return minOk && maxOk;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered.sort(
          (a, b) =>
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0'),
        );
        break;
      case 'price-desc':
        filtered.sort(
          (a, b) =>
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0'),
        );
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'created-asc':
      case 'created-desc':
        // Since createdAt isn't available in Product type, we'll keep original order
        // In a real implementation, you'd need to add createdAt to the Product type and query
        break;
      default:
        // 'featured' - keep original order
        break;
    }

    return filtered;
  }, [products, sortBy, availability, brands, priceRange]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-72 lg:flex-shrink-0">
        <CollectionFilters
          onSortChange={setSortBy}
          onAvailabilityChange={setAvailability}
          onPriceRangeChange={(min: number | null, max: number | null) =>
            setPriceRange({ min, max })
          }
          onBrandChange={setBrands}
          currentSort={sortBy}
          currentAvailability={availability}
          currentPriceRange={priceRange}
          currentBrands={brands}
          availableBrands={availableBrands}
        />
      </div>

      {/* Products Grid */}
      <div className="flex-1">
        {filteredAndSortedProducts.length === 0 ? (
          <div
            className="py-24 text-center text-lg text-body/70"
            role="status"
            aria-live="polite"
          >
            No products found matching your filters.
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label={`${filteredAndSortedProducts.length} products in ${collectionTitle}`}
          >
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
