'use client';

import React from 'react';
import { useABTest, FeatureFlag, useConversionTracking } from './ABTesting';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Product interface
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
}

// Example 1: A/B Testing Different CTA Buttons
export const HeroCTATest: React.FC = () => {
  const { getVariant, trackEvent } = useABTest();
  const { trackConversion } = useConversionTracking();

  const variant = getVariant('homepage_hero_test');

  const handleCTAClick = () => {
    trackEvent({
      event: 'click',
      testId: 'homepage_hero_test',
      variant: variant || 'control',
      properties: { element: 'hero_cta' },
      timestamp: new Date(),
    });
    trackConversion('email_signup', 5);
    // Navigate or trigger action
  };

  const getCTAText = () => {
    switch (variant) {
      case 'variant_a':
        return 'Get Started Now - Limited Time!';
      case 'variant_b':
        return 'Discover Premium Value';
      default:
        return 'Get Started';
    }
  };

  const getCTAStyle = () => {
    switch (variant) {
      case 'variant_a':
        return 'bg-red-600 hover:bg-red-700 animate-pulse';
      case 'variant_b':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="hero-section">
      <h1 className="text-4xl font-bold mb-6">
        {variant === 'variant_b' ? 'Premium Solutions for' : 'Welcome to'} Our
        Platform
      </h1>

      <Button
        onClick={handleCTAClick}
        className={`text-white px-8 py-3 rounded-lg font-semibold ${getCTAStyle()}`}
      >
        {getCTAText()}
      </Button>

      {variant === 'variant_a' && (
        <p className="text-sm text-red-600 mt-2 font-medium">
          ⏰ Offer expires in 24 hours!
        </p>
      )}

      {variant === 'variant_b' && (
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <span>✓ Premium Support</span>
          <span>✓ Advanced Features</span>
          <span>✓ Priority Access</span>
        </div>
      )}
    </div>
  );
};

// Example 2: Feature Flag Controlled Component
export const EnhancedSearchBar: React.FC = () => {
  const { trackEvent } = useABTest();

  const handleSearch = (query: string) => {
    trackEvent({
      event: 'search_performed',
      properties: {
        query_length: query.length,
      },
      timestamp: new Date(),
    });
  };

  return (
    <div>
      {/* Enhanced search with feature flag */}
      <FeatureFlag
        flagId="new_search_functionality"
        fallback={
          <FeatureFlag
            flagId="dark_mode"
            fallback={
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full p-3 border rounded-lg"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            }
          >
            <div className="search-container dark">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </FeatureFlag>
        }
      >
        <FeatureFlag
          flagId="dark_mode"
          fallback={
            <div className="enhanced-search">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search with AI suggestions..."
                  className="w-full p-3 pl-10 border rounded-lg bg-white"
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute left-3 top-3 text-gray-400">🔍</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {['Popular', 'On Sale', 'New Arrivals', 'Trending'].map(
                  (tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                      onClick={() => handleSearch(tag)}
                    >
                      {tag}
                    </button>
                  ),
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                💡 Try natural language: &quot;comfortable running shoes under
                $100&quot;
              </div>
            </div>
          }
        >
          <div className="enhanced-search dark">
            <div className="relative">
              <input
                type="text"
                placeholder="Search with AI suggestions..."
                className="w-full p-3 pl-10 border rounded-lg bg-white dark:bg-gray-800"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">🔍</div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {['Popular', 'On Sale', 'New Arrivals', 'Trending'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"
                  onClick={() => handleSearch(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              💡 Try natural language: &quot;comfortable running shoes under
              $100&quot;
            </div>
          </div>
        </FeatureFlag>
      </FeatureFlag>
    </div>
  );
};

// Example 3: A/B Testing Product Card Layouts
export const ProductCardTest: React.FC<{ product: Product }> = ({
  product,
}) => {
  const { getVariant, trackEvent } = useABTest();
  const { trackConversion } = useConversionTracking();

  const variant = getVariant('product_card_layout');

  const handleProductClick = () => {
    trackEvent({
      event: 'click',
      testId: 'product_card_layout',
      variant: variant || 'control',
      properties: {
        element: 'product_card',
        product_id: product.id,
        price: product.price,
      },
      timestamp: new Date(),
    });
  };

  const handleAddToCart = () => {
    trackEvent({
      event: 'click',
      testId: 'product_card_layout',
      variant: variant || 'control',
      properties: {
        element: 'add_to_cart_button',
        product_id: product.id,
      },
      timestamp: new Date(),
    });
    trackConversion('add_to_cart', product.price);
  };

  if (variant === 'variant_a') {
    // Image-focused layout
    return (
      <div className="product-card bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64 bg-gray-100">
          <button
            onClick={handleProductClick}
            className="w-full h-full relative block"
          >
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
            />
          </button>
          {product.badge && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
              {product.badge}
            </div>
          )}
        </div>

        <div className="p-3">
          <button onClick={handleProductClick} className="text-left w-full">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
              {product.title}
            </h3>
          </button>

          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold text-blue-600">
              ${product.price}
            </span>
            <Button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Control: Standard layout
  return (
    <div className="product-card bg-white rounded-lg shadow-md p-4">
      <div className="flex space-x-4">
        <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 relative">
          <button
            onClick={handleProductClick}
            className="w-full h-full relative block"
          >
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover rounded"
            />
          </button>
        </div>

        <div className="flex-1">
          <button onClick={handleProductClick} className="text-left w-full">
            <h3 className="font-semibold mb-1">{product.title}</h3>
          </button>

          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600">
              ${product.price}
            </span>

            <div className="flex space-x-2">
              <Button
                onClick={handleProductClick}
                variant="outline"
                className="px-3 py-1 text-sm"
              >
                View
              </Button>
              <Button
                onClick={handleAddToCart}
                className="px-3 py-1 bg-blue-600 text-white text-sm"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 4: Conditional Feature Rendering
export const ConditionalFeatures: React.FC = () => {
  const { trackEvent } = useABTest();

  const handleSocialLogin = (provider: string) => {
    trackEvent({
      event: 'click',
      properties: {
        element: 'social_login',
        provider,
      },
      timestamp: new Date(),
    });
  };

  const handleChatOpen = () => {
    trackEvent({
      event: 'click',
      properties: { element: 'chat_widget' },
      timestamp: new Date(),
    });
  };

  return (
    <div className="features-section">
      {/* Social Login */}
      <FeatureFlag flagId="social_login">
        <div className="social-login mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Login Options</h3>
          <div className="flex space-x-3">
            <Button
              onClick={() => handleSocialLogin('google')}
              className="flex items-center space-x-2 bg-red-600 text-white"
            >
              <span>🔴</span>
              <span>Google</span>
            </Button>
            <Button
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center space-x-2 bg-blue-600 text-white"
            >
              <span>📘</span>
              <span>Facebook</span>
            </Button>
            <Button
              onClick={() => handleSocialLogin('apple')}
              className="flex items-center space-x-2 bg-black text-white"
            >
              <span>🍎</span>
              <span>Apple</span>
            </Button>
          </div>
        </div>
      </FeatureFlag>

      {/* Real-time Chat */}
      <FeatureFlag flagId="real_time_chat">
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleChatOpen}
            className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700"
          >
            💬 Chat
          </Button>
        </div>
      </FeatureFlag>

      {/* Advanced Analytics Dashboard */}
      <FeatureFlag flagId="advanced_analytics">
        <div className="analytics-section">
          <h3 className="text-lg font-semibold mb-3">Advanced Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
              <h4 className="font-semibold">Conversion Rate</h4>
              <p className="text-2xl font-bold">4.2%</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg">
              <h4 className="font-semibold">Customer LTV</h4>
              <p className="text-2xl font-bold">$342</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg">
              <h4 className="font-semibold">Engagement Score</h4>
              <p className="text-2xl font-bold">8.7</p>
            </div>
          </div>
        </div>
      </FeatureFlag>
    </div>
  );
};

// Example 5: Pricing Display A/B Test
export const PricingDisplayTest: React.FC<{ product: Product }> = ({
  product,
}) => {
  const { getVariant, trackEvent } = useABTest();

  const variant = getVariant('pricing_display_test');
  const originalPrice = product.originalPrice || product.price * 1.2;
  const savings = originalPrice - product.price;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  const handlePriceClick = () => {
    trackEvent({
      event: 'click',
      testId: 'pricing_display_test',
      variant: variant || 'control',
      properties: {
        element: 'pricing_display',
        product_id: product.id,
        price: product.price,
      },
      timestamp: new Date(),
    });
  };

  switch (variant) {
    case 'with_savings':
      return (
        <button
          className="pricing-display text-left"
          onClick={handlePriceClick}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">
              ${product.price}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${originalPrice}
            </span>
          </div>
          <div className="text-sm font-semibold text-green-600">
            Save ${savings.toFixed(2)} ({savingsPercent}% off)
          </div>
        </button>
      );

    case 'with_urgency':
      return (
        <button
          className="pricing-display text-left"
          onClick={handlePriceClick}
        >
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl font-bold text-red-600">
                ${product.price}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ${originalPrice}
              </span>
            </div>
            <div className="text-sm font-semibold text-red-600">
              ⏰ Limited Time: {savingsPercent}% OFF
            </div>
            <div className="text-xs text-red-500 mt-1">
              Ends in 2 days, 14 hours
            </div>
          </div>
        </button>
      );

    default:
      // Control: Standard pricing
      return (
        <button
          className="pricing-display text-left"
          onClick={handlePriceClick}
        >
          <span className="text-2xl font-bold text-gray-900">
            ${product.price}
          </span>
        </button>
      );
  }
};

// Example Usage in a Page Component
export const ExampleUsagePage: React.FC = () => {
  const sampleProduct: Product = {
    id: 'product-123',
    title: 'Premium Wireless Headphones',
    description: 'High-quality audio with noise cancellation',
    price: 199.99,
    originalPrice: 249.99,
    image: '/images/placeholder-product.jpg',
    badge: 'Best Seller',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">A/B Testing Examples</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Hero CTA Test</h2>
        <HeroCTATest />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Enhanced Search (Feature Flag)
        </h2>
        <EnhancedSearchBar />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Product Card Layout Test
        </h2>
        <div className="max-w-md">
          <ProductCardTest product={sampleProduct} />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pricing Display Test</h2>
        <PricingDisplayTest product={sampleProduct} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Conditional Features</h2>
        <ConditionalFeatures />
      </section>
    </div>
  );
};
