'use client';

import React, { useState } from 'react';
import { textStyles, buttonStyles } from '@/lib/ui';

interface FilterOption {
  label: string;
  value: string;
}

const sortOptions: FilterOption[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Alphabetically, A-Z', value: 'title-asc' },
  { label: 'Alphabetically, Z-A', value: 'title-desc' },
  { label: 'Date: Old to New', value: 'created-asc' },
  { label: 'Date: New to Old', value: 'created-desc' },
];

const availabilityOptions: FilterOption[] = [
  { label: 'All Products', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

interface CollectionFiltersProps {
  onSortChange: (sort: string) => void;
  onAvailabilityChange: (availability: string) => void;
  onPriceRangeChange: (min: number | null, max: number | null) => void;
  onBrandChange: (brands: string[]) => void;
  currentSort: string;
  currentAvailability: string;
  currentPriceRange: { min: number | null; max: number | null };
  currentBrands: string[];
  availableBrands: string[];
}

export default function CollectionFilters({
  onSortChange,
  onAvailabilityChange,
  onPriceRangeChange,
  onBrandChange,
  currentSort,
  currentAvailability,
  currentPriceRange,
  currentBrands,
  availableBrands,
}: CollectionFiltersProps) {
  const [priceMin, setPriceMin] = useState<string>(
    currentPriceRange.min?.toString() || '',
  );
  const [priceMax, setPriceMax] = useState<string>(
    currentPriceRange.max?.toString() || '',
  );

  const handlePriceChange = () => {
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    onPriceRangeChange(min, max);
  };

  const resetFilters = () => {
    onSortChange('featured');
    onAvailabilityChange('all');
    onPriceRangeChange(null, null);
    onBrandChange([]);
    setPriceMin('');
    setPriceMax('');
  };

  const handleBrandToggle = (brand: string) => {
    if (currentBrands.includes(brand)) {
      onBrandChange(currentBrands.filter((b) => b !== brand));
    } else {
      onBrandChange([...currentBrands, brand]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sort Dropdown */}
      <div>
        <label
          htmlFor="sort-select"
          className={`${textStyles.bodySmall} font-medium text-foreground mb-2 block`}
        >
          Sort by:
        </label>
        <div className="relative">
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border/60 bg-background px-4 py-3 pr-10 text-sm font-medium text-foreground transition-all duration-200 hover:border-[hsl(var(--brand))]/40 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-foreground/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
        <h3 className={`${textStyles.h5} text-foreground mb-4`}>Filters</h3>
        <div className="space-y-5">
          {/* Availability Filter */}
          <fieldset>
            <legend
              className={`${textStyles.bodySmall} font-medium text-foreground mb-2 block`}
            >
              Availability
            </legend>
            <div className="space-y-2">
              {availabilityOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={currentAvailability === option.value}
                    onChange={(e) => onAvailabilityChange(e.target.value)}
                    className="h-4 w-4 text-[hsl(var(--brand))] focus:ring-[hsl(var(--brand))] focus:ring-offset-2"
                  />
                  <span className={`${textStyles.bodySmall} text-foreground`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div>
              <div
                className={`${textStyles.bodySmall} font-medium text-foreground mb-3 block`}
              >
                Brands
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={currentBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="h-4 w-4 text-[hsl(var(--brand))] focus:ring-[hsl(var(--brand))] focus:ring-offset-2 rounded"
                    />
                    <span className={`${textStyles.bodySmall} text-foreground`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <div
              className={`${textStyles.bodySmall} font-medium text-foreground mb-2 block`}
            >
              Price Range
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <label className="w-full">
                  <span className="sr-only">Minimum price</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
                  />
                </label>
                <label className="w-full">
                  <span className="sr-only">Maximum price</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handlePriceChange}
                className={`${buttonStyles.outline} w-full py-2 text-sm`}
              >
                Apply Price Range
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              type="button"
              onClick={resetFilters}
              className={`${buttonStyles.ghost} w-full py-2 text-sm`}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
