'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearch } from '@/hooks/useSearch';
import type { PredictiveSearchResult } from '@/types/search';
import { AnalyticsTracker } from '@/lib/analytics-tracking-enhanced';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { predictiveSearch, isLoading, error } = useSearch();
  const [predictiveResults, setPredictiveResults] =
    useState<PredictiveSearchResult | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentSearches(
            parsed.filter(
              (item: RecentSearch) =>
                Date.now() - item.timestamp < 30 * 24 * 60 * 60 * 1000, // 30 days
            ),
          );
        }
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced predictive search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim() && query.length >= 2) {
        try {
          const results = await predictiveSearch(query.trim());
          setPredictiveResults(results);
        } catch (error) {
          console.error('Predictive search failed:', error);
          setPredictiveResults(null);
        }
      } else {
        setPredictiveResults(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, predictiveSearch]);

  const getMaxSelectableIndex = useCallback(() => {
    if (query.trim() && predictiveResults) {
      return (
        (predictiveResults.queries?.length || 0) +
        (predictiveResults.products?.length || 0) +
        (predictiveResults.collections?.length || 0) -
        1
      );
    }
    return recentSearches.length - 1;
  }, [query, predictiveResults, recentSearches]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      // Track search query analytics
      const resultsCount = predictiveResults
        ? (predictiveResults.products?.length || 0) +
          (predictiveResults.collections?.length || 0) +
          (predictiveResults.queries?.length || 0)
        : 0;

      AnalyticsTracker.trackSearchQuery(searchQuery, resultsCount, 'header');

      // Save to recent searches
      const newSearch: RecentSearch = {
        query: searchQuery,
        timestamp: Date.now(),
      };

      const updatedRecent = [
        newSearch,
        ...recentSearches.filter((item) => item.query !== searchQuery),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updatedRecent);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            RECENT_SEARCHES_KEY,
            JSON.stringify(updatedRecent),
          );
        } catch (error) {
          console.error('Failed to save recent search:', error);
        }
      }

      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    },
    [recentSearches, predictiveResults],
  );

  const handleEnterKey = useCallback(() => {
    if (selectedIndex >= 0) {
      // Handle selection based on index
      if (query.trim() && predictiveResults) {
        const queriesLength = predictiveResults.queries?.length || 0;
        const productsLength = predictiveResults.products?.length || 0;

        if (selectedIndex < queriesLength) {
          // Selected a query suggestion
          const selectedQuery = predictiveResults.queries?.[selectedIndex];
          if (selectedQuery) {
            // Track predictive search click
            AnalyticsTracker.trackSearchResultClick(
              query,
              'page',
              selectedQuery.text,
              selectedIndex,
            );
            handleSearch(selectedQuery.text);
          }
        } else if (selectedIndex < queriesLength + productsLength) {
          // Selected a product
          const productIndex = selectedIndex - queriesLength;
          const selectedProduct = predictiveResults.products?.[productIndex];
          if (selectedProduct) {
            // Track product click from predictive search
            AnalyticsTracker.trackSearchResultClick(
              query,
              'product',
              selectedProduct.id,
              selectedIndex,
            );
            window.location.href = `/products/${selectedProduct.handle}`;
          }
        } else {
          // Selected a collection
          const collectionIndex =
            selectedIndex - queriesLength - productsLength;
          const selectedCollection =
            predictiveResults.collections?.[collectionIndex];
          if (selectedCollection) {
            // Track collection click from predictive search
            AnalyticsTracker.trackSearchResultClick(
              query,
              'collection',
              selectedCollection.id,
              selectedIndex,
            );
            window.location.href = `/collections/${selectedCollection.handle}`;
          }
        }
      } else if (selectedIndex < recentSearches.length) {
        // Selected a recent search
        const selectedRecent = recentSearches[selectedIndex];
        handleSearch(selectedRecent.query);
      }
    } else if (query.trim()) {
      handleSearch(query.trim());
    }
  }, [selectedIndex, query, predictiveResults, recentSearches, handleSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const maxIndex = getMaxSelectableIndex();
            return prev < maxIndex ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const maxIndex = getMaxSelectableIndex();
            return prev > 0 ? prev - 1 : maxIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          handleEnterKey();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    selectedIndex,
    predictiveResults,
    recentSearches,
    query,
    getMaxSelectableIndex,
    handleEnterKey,
    onClose,
  ]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  const renderSearchSuggestions = () => {
    if (query.trim() && predictiveResults) {
      let currentIndex = 0;

      return (
        <div className="space-y-2">
          {/* Query suggestions */}
          {predictiveResults.queries &&
            predictiveResults.queries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-4">
                  Suggestions
                </h4>
                {predictiveResults.queries.map((suggestion, index) => (
                  <button
                    key={`query-${index}`}
                    className={`w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center gap-3 ${
                      selectedIndex === currentIndex++ ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSearch(suggestion.text)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}

          {/* Product suggestions */}
          {predictiveResults.products &&
            predictiveResults.products.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-4">
                  Products
                </h4>
                {predictiveResults.products.map((product, index) => (
                  <Link
                    key={`product-${index}`}
                    href={`/products/${product.handle}`}
                    className={`block px-4 py-3 hover:bg-muted/50 ${
                      selectedIndex === currentIndex++ ? 'bg-muted' : ''
                    }`}
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      {product.images.edges[0] && (
                        <Image
                          src={product.images.edges[0].node.url}
                          alt={
                            product.images.edges[0].node.altText ||
                            product.title
                          }
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.title}</p>
                        {product.priceRange && (
                          <p className="text-sm text-muted-foreground">
                            ${product.priceRange.minVariantPrice.amount}
                            {product.priceRange.minVariantPrice.amount !==
                              product.priceRange.maxVariantPrice.amount &&
                              ` - $${product.priceRange.maxVariantPrice.amount}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          {/* Collection suggestions */}
          {predictiveResults.collections &&
            predictiveResults.collections.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-4">
                  Collections
                </h4>
                {predictiveResults.collections.map((collection, index) => (
                  <Link
                    key={`collection-${index}`}
                    href={`/collections/${collection.handle}`}
                    className={`block px-4 py-3 hover:bg-muted/50 ${
                      selectedIndex === currentIndex++ ? 'bg-muted' : ''
                    }`}
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      {collection.image && (
                        <Image
                          src={collection.image.url}
                          alt={collection.image.altText || collection.title}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {collection.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Collection
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          {/* View all results */}
          {query.trim() && (
            <div className="px-4 py-2 border-t">
              <button
                onClick={() => handleSearch(query.trim())}
                className="w-full text-left py-2 text-sm text-primary hover:underline"
              >
                View all results for &quot;{query.trim()}&quot;
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderRecentSearches = () => {
    if (!query.trim() && recentSearches.length > 0) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent searches
            </h4>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          {recentSearches.map((recent, index) => (
            <button
              key={`recent-${index}`}
              className={`w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center gap-3 ${
                selectedIndex === index ? 'bg-muted' : ''
              }`}
              onClick={() => handleSearch(recent.query)}
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{recent.query}</span>
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-2xl pt-20">
        <div className="bg-background rounded-lg shadow-lg border">
          {/* Search Input */}
          <div className="relative border-b">
            <div className="flex items-center px-4">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, collections..."
                className="border-0 text-lg placeholder:text-muted-foreground focus:ring-0 focus:border-0"
                autoComplete="off"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            )}

            {error && (
              <div className="px-4 py-8 text-center text-destructive">
                Something went wrong. Please try again.
              </div>
            )}

            {!isLoading && !error && (
              <>
                {renderSearchSuggestions()}
                {renderRecentSearches()}

                {!query.trim() && recentSearches.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start typing to search for products</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
