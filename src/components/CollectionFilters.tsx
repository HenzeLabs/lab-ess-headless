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

interface CollectionFiltersProps {
  onSortChange: (sort: string) => void;
  onPriceRangeChange: (min: number | null, max: number | null) => void;
  currentSort: string;
  currentPriceRange: { min: number | null; max: number | null };
}

export default function CollectionFilters({
  onSortChange,
  onPriceRangeChange,
  currentSort,
  currentPriceRange,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceChange();
    }
  };

  const resetFilters = () => {
    onSortChange('featured');
    onPriceRangeChange(null, null);
    setPriceMin('');
    setPriceMax('');
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

      {/* Price Range Filter */}
      <div>
        <label
          htmlFor="price-range"
          className={`${textStyles.bodySmall} font-medium text-foreground mb-2 block`}
        >
          Price Range:
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <label className="w-full">
              <span className="sr-only">Minimum price</span>
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onKeyPress={handleKeyPress}
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
                onKeyPress={handleKeyPress}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handlePriceChange}
            className={`${buttonStyles.outline} w-full py-2 text-sm`}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Reset Filters */}
      <button
        type="button"
        onClick={resetFilters}
        className={`${buttonStyles.ghost} w-full py-2 text-sm`}
      >
        Reset Filters
      </button>
    </div>
  );
}
