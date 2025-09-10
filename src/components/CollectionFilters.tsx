"use client";

import { useState, useMemo } from "react";

interface FilterSection {
  title: string;
  options: { label: string; count?: number }[];
}

import { Product } from "@/lib/types";

interface CollectionFiltersProps {
  products: Product[];
}

export default function CollectionFilters({
  products = [],
}: CollectionFiltersProps) {
  const [openSections, setOpenSections] = useState<string[]>(["Price Range"]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  // Generate filters from actual product data
  const filterData = useMemo(() => {
    const filters: FilterSection[] = [];

    // Price Range filters
    const priceRanges = [
      { label: "Under $1,000", min: 0, max: 1000 },
      { label: "$1,000 - $5,000", min: 1000, max: 5000 },
      { label: "$5,000 - $10,000", min: 5000, max: 10000 },
      { label: "$10,000 - $20,000", min: 10000, max: 20000 },
      { label: "$20,000+", min: 20000, max: Infinity },
    ];

    const priceOptions = priceRanges
      .map((range) => {
        const count = products.filter((product) => {
          const price = parseFloat(
            product.priceRange?.minVariantPrice?.amount || "0",
          );
          return (
            price >= range.min &&
            (range.max === Infinity ? true : price < range.max)
          );
        }).length;
        return { label: range.label, count };
      })
      .filter((option) => option.count > 0);

    if (priceOptions.length > 0) {
      filters.push({
        title: "Price Range",
        options: priceOptions,
      });
    }

    // Tags-based filters (only if products have tags)
    if (products.length > 0) {
      const allTags: string[] = [];
      products.forEach((product) => {
        allTags.push(...(product.tags || []));
      });

      const tagCounts: Record<string, number> = {};
      allTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      const tagOptions = Object.entries(tagCounts)
        .map(([tag, count]) => ({ label: tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Show top 10 tags

      if (tagOptions.length > 0) {
        filters.push({
          title: "Tags",
          options: tagOptions,
        });
      }
    }

    return filters;
  }, [products]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const handleFilterChange = (
    section: string,
    option: string,
    checked: boolean,
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [section]: checked
        ? [...(prev[section] || []), option]
        : (prev[section] || []).filter((item) => item !== option),
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, filters) => total + filters.length,
      0,
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-koala-green hover:text-green-700 font-medium"
          >
            Clear All ({getActiveFiltersCount()})
          </button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Active Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([section, filters]) =>
              filters.map((filter) => (
                <span
                  key={`${section}-${filter}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-koala-green text-white text-sm rounded-full"
                >
                  {filter}
                  <button
                    onClick={() => handleFilterChange(section, filter, false)}
                    className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              )),
            )}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-6">
        {filterData.map((section) => (
          <div
            key={section.title}
            className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-medium text-gray-900">
                {section.title}
              </h4>
              <svg
                className={`w-4 h-4 transition-transform ${
                  openSections.includes(section.title) ? "rotate-180" : ""
                }`}
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
            </button>

            {openSections.includes(section.title) && (
              <div className="mt-4 space-y-3">
                {section.options.map((option) => (
                  <label
                    key={option.label}
                    className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedFilters[section.title]?.includes(
                            option.label,
                          ) || false
                        }
                        onChange={(e) =>
                          handleFilterChange(
                            section.title,
                            option.label,
                            e.target.checked,
                          )
                        }
                        className="mr-3 h-4 w-4 text-koala-green border-gray-300 rounded focus:ring-koala-green focus:ring-2"
                      />
                      <span>{option.label}</span>
                    </div>
                    {option.count && (
                      <span className="text-xs text-gray-400">
                        ({option.count})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Price Range Slider */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Custom Price Range
        </h4>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Min</label>
              <input
                type="number"
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max</label>
              <input
                type="number"
                placeholder="$5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <button className="w-full bg-koala-green text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
            Apply Price Filter
          </button>
        </div>
      </div>
    </div>
  );
}
