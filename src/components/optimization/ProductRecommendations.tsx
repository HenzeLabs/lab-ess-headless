'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { ABTest } from './ABTestingFramework';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, TrendingUp, Clock, Star } from 'lucide-react';

interface ProductRecommendationsProps {
  currentProduct?: Product;
  userId?: string;
  category?: string;
  className?: string;
  maxRecommendations?: number;
  type?: 'similar' | 'trending' | 'recently-viewed' | 'cross-sell' | 'upsell';
}

interface Recommendation {
  product: Product;
  score: number;
  reason: string;
  type: 'similar' | 'trending' | 'cross-sell' | 'upsell' | 'personal';
}

export function ProductRecommendations({
  currentProduct,
  userId,
  category,
  className = '',
  maxRecommendations = 6,
  type = 'similar',
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load viewed products from localStorage
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      setViewedProducts(JSON.parse(stored));
    }
  }, []);

  const generateRecommendations = React.useCallback(async () => {
    setIsLoading(true);

    try {
      // In a real app, this would be an API call
      const mockRecommendations = await mockRecommendationsAPI({
        currentProduct,
        userId,
        category,
        type,
        limit: maxRecommendations,
      });

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProduct, userId, category, type, maxRecommendations]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleProductClick = (product: Product) => {
    // Track product view for analytics
    if (typeof window !== 'undefined') {
      // Add to recently viewed
      const updated = [
        product,
        ...viewedProducts.filter((p) => p.id !== product.id),
      ].slice(0, 10);
      setViewedProducts(updated);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));

      // Track analytics
      if (window.gtag) {
        window.gtag('event', 'view_item', {
          currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
          value: parseFloat(product.priceRange?.minVariantPrice?.amount || '0'),
          item_id: product.id,
          item_name: product.title,
          item_category: category,
          recommendation_type: type,
        });
      }
    }
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track add to cart from recommendations
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
        value: parseFloat(product.priceRange?.minVariantPrice?.amount || '0'),
        item_id: product.id,
        item_name: product.title,
        source: 'recommendations',
        recommendation_type: type,
      });
    }

    // Add to cart logic would go here
    console.log('Adding to cart:', product.title);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: maxRecommendations }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'recently-viewed':
        return <Clock className="h-4 w-4" />;
      case 'cross-sell':
        return <ShoppingCart className="h-4 w-4" />;
      case 'upsell':
        return <Star className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'trending':
        return 'Trending Now';
      case 'recently-viewed':
        return 'Recently Viewed';
      case 'cross-sell':
        return 'Customers Also Bought';
      case 'upsell':
        return 'Premium Options';
      case 'similar':
        return 'Similar Products';
      default:
        return 'Recommended for You';
    }
  };

  return (
    <ABTest testId="recommendation_layout">
      {(variant) => (
        <div className={`space-y-4 ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTypeIcon()}
              <h3 className="text-lg font-semibold">{getTypeTitle()}</h3>
            </div>
            {variant?.id === 'variant_b' && (
              <Button variant="outline" size="sm">
                View All
              </Button>
            )}
          </div>

          <div
            className={
              variant?.id === 'variant_b'
                ? 'flex space-x-4 overflow-x-auto pb-4'
                : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'
            }
          >
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.product.id}
                recommendation={rec}
                isCarousel={variant?.id === 'variant_b'}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      )}
    </ABTest>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  isCarousel: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

function RecommendationCard({
  recommendation,
  isCarousel,
  onProductClick,
  onAddToCart,
}: RecommendationCardProps) {
  const { product, reason } = recommendation;
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);

  return (
    <div className={`group relative ${isCarousel ? 'flex-shrink-0 w-48' : ''}`}>
      <Link
        href={`/products/${product.handle}`}
        onClick={() => onProductClick(product)}
        className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="aspect-square relative">
          <Image
            src={product.featuredImage?.url || '/placeholder.jpg'}
            alt={product.featuredImage?.altText || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Recommendation Badge */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {reason}
          </div>

          {/* Quick Add Button */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={(e) => onAddToCart(product, e)}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-3">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">
            {product.title}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600">
              {formattedPrice}
            </span>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">
                {(Math.random() * 2 + 3).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Mock API function - replace with real API call
async function mockRecommendationsAPI({
  // currentProduct,
  // userId,
  // category,
  type,
  limit,
}: {
  currentProduct?: Product;
  userId?: string;
  category?: string;
  type: string;
  limit: number;
}): Promise<Recommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock product data - in real app, this would come from your API
  const mockProducts: Product[] = [
    {
      id: 'rec-1',
      handle: 'professional-camera',
      title: 'Professional Digital Camera',
      description: 'High-end camera for professionals',
      featuredImage: {
        url: '/images/camera.jpg',
        altText: 'Professional Camera',
      },
      priceRange: {
        minVariantPrice: {
          amount: '2499.99',
          currencyCode: 'USD',
        },
      },
      tags: ['professional', 'camera', 'photography'],
      variants: {
        edges: [
          {
            node: {
              id: 'variant-1',
              title: 'Standard',
              availableForSale: true,
              price: { amount: '2499.99', currencyCode: 'USD' },
            },
          },
        ],
      },
    },
    // Add more mock products as needed
  ];

  // Generate recommendations based on type
  const recommendations: Recommendation[] = mockProducts
    .slice(0, limit)
    .map((product) => ({
      product,
      score: Math.random() * 100,
      reason: getRecommendationReason(type),
      type: type as
        | 'similar'
        | 'trending'
        | 'cross-sell'
        | 'upsell'
        | 'personal',
    }));

  return recommendations;
}

function getRecommendationReason(type: string): string {
  switch (type) {
    case 'trending':
      return 'Trending';
    case 'recently-viewed':
      return 'You viewed';
    case 'cross-sell':
      return 'Often bought';
    case 'upsell':
      return 'Premium';
    case 'similar':
      return 'Similar';
    default:
      return 'For you';
  }
}
