'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Grid, List, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ABTest,
  useABTestConversion,
} from '@/components/optimization/ABTestingFramework';
import type { Product } from '@/lib/types';
import { trackAddToCart, trackViewItem } from '@/lib/analytics';

interface SmartProductDiscoveryProps {
  products: Product[];
  searchQuery?: string;
  onFilterChange?: (filters: ProductFilters) => void;
}

interface ProductFilters {
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating';
  inStock: boolean;
}

interface ProductRecommendation {
  id: string;
  reason: string;
  confidence: number;
}

export default function SmartProductDiscovery({
  products,
  searchQuery = '',
  onFilterChange,
}: SmartProductDiscoveryProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ProductFilters>({
    priceRange: [0, 10000],
    brands: [],
    categories: [],
    sortBy: 'relevance',
    inStock: true,
  });
  const [recommendations, setRecommendations] = useState<
    ProductRecommendation[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);

  const trackDiscoveryEvent = useABTestConversion(
    'product_discovery_enhancement',
    'view_item',
  );

  // Smart product filtering and sorting
  const filteredProducts = products.filter((product) => {
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.title.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Price range
    const price = parseFloat(
      product.priceRange?.minVariantPrice?.amount || '0',
    );
    if (price < filters.priceRange[0] || price > filters.priceRange[1])
      return false;

    // Stock filter - check if variants are available
    if (filters.inStock) {
      const hasAvailableVariant = product.variants?.edges?.some(
        (edge) => edge.node.availableForSale,
      );
      if (!hasAvailableVariant) return false;
    }

    return true;
  });

  // Smart sorting with multiple factors
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = parseFloat(a.priceRange?.minVariantPrice?.amount || '0');
    const bPrice = parseFloat(b.priceRange?.minVariantPrice?.amount || '0');

    switch (filters.sortBy) {
      case 'price_low':
        return aPrice - bPrice;
      case 'price_high':
        return bPrice - aPrice;
      case 'newest':
        // Use title length as a proxy for newer products (longer, more descriptive titles)
        return b.title.length - a.title.length;
      case 'rating':
        // Simulate rating based on title keywords and price
        const aRating = calculateProductRating(a);
        const bRating = calculateProductRating(b);
        return bRating - aRating;
      case 'relevance':
      default:
        // Smart relevance scoring
        const aScore = calculateRelevanceScore(a, searchTerm);
        const bScore = calculateRelevanceScore(b, searchTerm);
        return bScore - aScore;
    }
  });

  // Get unique brands from metafields or use "Professional Lab Equipment" as default
  const availableBrands = [
    'Professional Lab Equipment',
    'Scientific',
    'Research Grade',
    'Educational',
  ];

  // Generate smart recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const recs: ProductRecommendation[] = [];

      // Trending products (based on tags)
      const trendingProducts = products
        .filter(
          (p) =>
            p.tags?.includes('popular') ||
            p.tags?.includes('bestseller') ||
            p.title.toLowerCase().includes('professional'),
        )
        .slice(0, 3);

      trendingProducts.forEach((product) => {
        recs.push({
          id: product.id,
          reason: 'Trending in your category',
          confidence: 0.85,
        });
      });

      // Price-based recommendations
      if (searchTerm) {
        const avgPrice =
          products.reduce(
            (sum, p) =>
              sum + parseFloat(p.priceRange?.minVariantPrice?.amount || '0'),
            0,
          ) / products.length;

        const budgetFriendly = products
          .filter(
            (p) =>
              parseFloat(p.priceRange?.minVariantPrice?.amount || '0') <
              avgPrice * 0.8,
          )
          .slice(0, 2);

        budgetFriendly.forEach((product) => {
          recs.push({
            id: product.id,
            reason: 'Great value for money',
            confidence: 0.75,
          });
        });
      }

      setRecommendations(recs);
    };

    generateRecommendations();
  }, [products, searchTerm]);

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleProductClick = (product: Product) => {
    trackViewItem({
      id: product.id,
      name: product.title,
      price: parseFloat(product.priceRange?.minVariantPrice?.amount || '0'),
      currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
      category: product.tags?.[0] || 'lab-equipment',
    });
    trackDiscoveryEvent();
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart logic here
    trackAddToCart({
      id: product.id,
      name: product.title,
      price: parseFloat(product.priceRange?.minVariantPrice?.amount || '0'),
      currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
      quantity: 1,
      category: product.tags?.[0] || 'lab-equipment',
    });
  };

  return (
    <div className="space-y-6">
      {/* Smart Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, specifications, or model..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label
                htmlFor="price-range"
                className="block text-sm font-medium mb-2"
              >
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  id="price-range"
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange({
                      priceRange: [
                        filters.priceRange[0],
                        parseInt(e.target.value),
                      ],
                    })
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label
                htmlFor="brand-filter"
                className="block text-sm font-medium mb-2"
              >
                Brand
              </label>
              <select
                id="brand-filter"
                value={filters.brands[0] || ''}
                onChange={(e) =>
                  handleFilterChange({
                    brands: e.target.value ? [e.target.value] : [],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">All Brands</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sort-by"
                className="block text-sm font-medium mb-2"
              >
                Sort By
              </label>
              <select
                id="sort-by"
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange({
                    sortBy: e.target.value as ProductFilters['sortBy'],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <span className="block text-sm font-medium mb-2">View</span>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          {sortedProducts.length} products found{' '}
          {searchTerm && `for "${searchTerm}"`}
        </div>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Smart Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const product = products.find((p) => p.id === rec.id);
              if (!product) return null;

              return (
                <Link
                  key={rec.id}
                  href={`/products/${product.handle}`}
                  className="block text-sm hover:text-blue-600"
                  onClick={() => handleProductClick(product)}
                >
                  <strong>{product.title}</strong> - {rec.reason}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Grid/List */}
      <ABTest testId="product_card_layout">
        {(variant, isLoading) => {
          if (isLoading) {
            return <div className="text-center py-8">Loading products...</div>;
          }

          const isCompact = variant?.id === 'variant_a';

          return (
            <div
              className={
                viewMode === 'grid'
                  ? `grid gap-6 ${
                      isCompact
                        ? 'grid-cols-2 md:grid-cols-4'
                        : 'grid-cols-1 md:grid-cols-3'
                    }`
                  : 'space-y-4'
              }
            >
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isCompact={isCompact}
                  viewMode={viewMode}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          );
        }}
      </ABTest>

      {/* Load More */}
      {sortedProducts.length > 12 && (
        <div className="text-center">
          <Button variant="outline">Load More Products</Button>
        </div>
      )}
    </div>
  );
}

// Enhanced Product Card Component
interface ProductCardProps {
  product: Product;
  isCompact: boolean;
  viewMode: 'grid' | 'list';
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

function ProductCard({
  product,
  isCompact,
  viewMode,
  onProductClick,
  onAddToCart,
}: ProductCardProps) {
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);

  const rating = calculateProductRating(product);
  const isAvailable =
    product.variants?.edges?.some((edge) => edge.node.availableForSale) ?? true;

  if (viewMode === 'list') {
    return (
      <Link
        href={`/products/${product.handle}`}
        onClick={() => onProductClick(product)}
        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="w-20 h-20 relative flex-shrink-0">
          <Image
            src={product.featuredImage?.url || '/placeholder.jpg'}
            alt={product.featuredImage?.altText || product.title}
            fill
            className="object-cover rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{product.title}</h3>
          <div className="flex items-center mt-1">
            <StarRating rating={rating} />
            <span className="ml-2 text-sm text-gray-600">
              ({rating.toFixed(1)})
            </span>
          </div>
          <p className="text-gray-600 mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="text-right">
          <ABTest testId="pricing_display">
            {(variant) => (
              <div
                className={
                  variant?.id === 'variant_a'
                    ? 'text-2xl font-bold text-blue-600'
                    : 'text-xl font-semibold'
                }
              >
                {formattedPrice}
              </div>
            )}
          </ABTest>
          <Button
            onClick={(e) => onAddToCart(product, e)}
            size="sm"
            className="mt-2"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      onClick={() => onProductClick(product)}
      className={`group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
        isCompact ? 'h-64' : 'h-80'
      }`}
    >
      <div className={`relative ${isCompact ? 'h-32' : 'h-48'}`}>
        <Image
          src={product.featuredImage?.url || '/placeholder.jpg'}
          alt={product.featuredImage?.altText || product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3
          className={`font-semibold ${
            isCompact ? 'text-sm' : 'text-lg'
          } line-clamp-2`}
        >
          {product.title}
        </h3>
        <div className="flex items-center mt-1">
          <StarRating rating={rating} size={isCompact ? 'sm' : 'md'} />
          <span className="ml-2 text-sm text-gray-600">
            ({rating.toFixed(1)})
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <ABTest testId="pricing_display">
            {(variant) => (
              <span
                className={
                  variant?.id === 'variant_a'
                    ? 'text-lg font-bold text-blue-600'
                    : 'text-lg font-semibold'
                }
              >
                {formattedPrice}
              </span>
            )}
          </ABTest>
          <Button
            onClick={(e) => onAddToCart(product, e)}
            size="sm"
            variant="outline"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Star Rating Component
function StarRating({
  rating,
  size = 'md',
}: {
  rating: number;
  size?: 'sm' | 'md';
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex">
      {stars.map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// Utility Functions
function calculateProductRating(product: Product): number {
  // Simulate rating based on various factors
  let score = 3.0; // Base score

  // Price factor (higher price = potentially higher quality)
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
  if (price > 1000) score += 0.5;
  if (price > 5000) score += 0.3;

  // Popular tags
  const popularTags = ['professional', 'advanced', 'precision', 'certified'];
  const hasPopularTags = product.tags?.some((tag) =>
    popularTags.some((popular) =>
      tag.toLowerCase().includes(popular.toLowerCase()),
    ),
  );
  if (hasPopularTags) score += 0.4;

  // Availability
  const isAvailable = product.variants?.edges?.some(
    (edge) => edge.node.availableForSale,
  );
  if (isAvailable) score += 0.2;

  // Random factor for variation
  score += (Math.random() - 0.5) * 0.6;

  return Math.max(1.0, Math.min(5.0, score));
}

function calculateRelevanceScore(product: Product, searchTerm: string): number {
  if (!searchTerm) return 1;

  let score = 0;
  const searchLower = searchTerm.toLowerCase();

  // Title match (highest weight)
  if (product.title.toLowerCase().includes(searchLower)) score += 10;

  // Exact title match
  if (product.title.toLowerCase() === searchLower) score += 20;

  // Description match
  if (product.description?.toLowerCase().includes(searchLower)) score += 5;

  // Tags match
  product.tags?.forEach((tag) => {
    if (tag.toLowerCase().includes(searchLower)) score += 3;
  });

  return score;
}
