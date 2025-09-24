'use client';
import { trackAddToCart } from '@/lib/analytics';
import React, { useState, useTransition, lazy, Suspense } from 'react';
import ConversionBoosters from './ConversionBoosters';
import TechnicalSpecs from './TechnicalSpecs';
import ReviewsAndTrust from './ReviewsAndTrust';
import ShippingInformation from './ShippingInformation';

// Lazy load heavy advanced components to improve initial load time
const PersonalizationEngine = lazy(() => import('./PersonalizationEngine'));
const SmartInventoryManagement = lazy(
  () => import('./SmartInventoryManagement'),
);
const AdvancedAnalyticsDashboard = lazy(
  () => import('./AdvancedAnalyticsDashboard'),
);
const AdvancedCheckoutOptimization = lazy(() =>
  import('./AdvancedCheckoutOptimization').then((module) => ({
    default: module.AdvancedCheckoutOptimization,
  })),
);
const IntelligentSearchAndDiscovery = lazy(() =>
  import('./IntelligentSearchAndDiscovery').then((module) => ({
    default: module.IntelligentSearchAndDiscovery,
  })),
);
const SmartPricingEngine = lazy(() =>
  import('./SmartPricingEngine').then((module) => ({
    default: module.SmartPricingEngine,
  })),
);

// using API route for cart mutations
import { buttonStyles, textStyles } from '@/lib/ui';

type Variant = {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale?: boolean;
};

type ProductInfoPanelProps = {
  product: {
    id: string;
    title: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    tags?: string[];
    variants: { edges: { node: Variant }[] };
    descriptionHtml?: string;
  };
};

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.edges?.[0]?.node.id,
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const variants = product.variants?.edges?.map((edge) => edge.node) ?? [];

  // Calculate price based on selected variant
  const selectedVariantData = variants.find((v) => v.id === selectedVariant);
  const currentPrice =
    selectedVariantData?.price?.amount ??
    product.priceRange?.minVariantPrice?.amount ??
    null;
  const currentCurrency =
    selectedVariantData?.price?.currencyCode ??
    product.priceRange?.minVariantPrice?.currencyCode ??
    'USD';

  // Determine product type for technical specs
  const getProductType = (
    title: string,
    tags?: string[],
  ): 'microscope' | 'centrifuge' | 'camera' | 'incubator' | 'general' => {
    const titleLower = title.toLowerCase();
    const allTags = tags?.join(' ').toLowerCase() || '';

    if (titleLower.includes('microscope') || allTags.includes('microscope'))
      return 'microscope';
    if (titleLower.includes('centrifuge') || allTags.includes('centrifuge'))
      return 'centrifuge';
    if (titleLower.includes('camera') || allTags.includes('camera'))
      return 'camera';
    if (titleLower.includes('incubator') || allTags.includes('incubator'))
      return 'incubator';
    return 'general';
  };

  const productType = getProductType(product.title, product.tags);

  return (
    <div className="sticky top-8 flex flex-col space-y-6">
      <div className="space-y-4">
        <h1 className={`${textStyles.h1}`} data-test-id="product-title">
          {product.title}
        </h1>
        <div className="space-y-2">
          <p
            className={`${textStyles.h3} text-foreground`}
            data-test-id="product-price"
          >
            $
            {currentPrice
              ? Number(currentPrice).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : 'Price not available'}
          </p>
          <p
            className={`${textStyles.bodySmall} text-[hsl(var(--brand))]`}
            data-test-id="product-stock"
          >
            In stock
          </p>
        </div>
      </div>
      {variants.length > 0 && (
        <div className="space-y-3">
          <label
            htmlFor="variant-select"
            className={`${textStyles.bodySmall} font-medium text-foreground`}
          >
            Options
          </label>
          <div className="relative">
            <select
              id="variant-select"
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
              aria-label="Product options"
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              data-test-id="variant-selector"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground pointer-events-none"
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
      )}
      {/* Collapsible Product Description */}
      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
          onClick={() => setShowDescription((v) => !v)}
          aria-expanded={showDescription}
          aria-controls="product-description-panel"
        >
          Product Description
          <svg
            className={`ml-2 h-4 w-4 transition-transform ${
              showDescription ? 'rotate-180' : ''
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
        {showDescription && (
          <div
            id="product-description-panel"
            className={`${textStyles.body} animate-fade-in px-4 py-3 bg-muted/20 rounded-xl border border-border/50`}
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? '' }}
            data-test-id="product-description"
          />
        )}
      </div>
      <div className="space-y-3">
        <button
          type="button"
          className={`${buttonStyles.primary} w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
          disabled={isPending || !selectedVariant}
          onClick={() => {
            if (!selectedVariant) return;
            setFeedback(null);
            setIsError(false);
            startTransition(async () => {
              try {
                // Add timeout protection to prevent hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    variantId: selectedVariant,
                    quantity: 1,
                  }),
                  signal: controller.signal,
                });

                clearTimeout(timeoutId);
                // Signal other parts of the app (e.g., header) to refresh cart count
                window.dispatchEvent(new CustomEvent('cart:updated'));
                trackAddToCart({
                  id: product.id,
                  name: product.title,
                  price: currentPrice,
                  currency: currentCurrency,
                  quantity: 1,
                  category: product.tags?.[0] ?? null,
                });
                setFeedback('Added to cart successfully!');
                setIsError(false);
              } catch (e) {
                if (e instanceof Error && e.name === 'AbortError') {
                  setFeedback('Request timed out. Please try again.');
                } else {
                  setFeedback('Error adding to cart');
                }
                setIsError(true);
              }
            });
          }}
          data-test-id="add-to-cart-button"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                ></circle>
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding...
            </span>
          ) : (
            'Add to cart'
          )}
        </button>

        {feedback && (
          <div
            className={`${textStyles.bodySmall} ${
              isError
                ? 'text-[hsl(var(--destructive))]'
                : 'text-[hsl(var(--brand))]'
            } bg-background border border-border rounded-lg px-3 py-2`}
            data-test-id="cart-feedback"
          >
            {feedback}
          </div>
        )}

        <div className={`${textStyles.caption} text-muted-foreground`}>
          or 4 payments of $
          {currentPrice ? (Number(currentPrice) / 4).toFixed(2) : '0.00'} with
          Afterpay
        </div>
      </div>

      {/* Conversion Boosters */}
      <ConversionBoosters productId={product.id} inStock={true} />

      {/* Technical Specifications */}
      <TechnicalSpecs productType={productType} />

      {/* Reviews and Trust Signals */}
      <ReviewsAndTrust />

      {/* Shipping Information */}
      <ShippingInformation
        productWeight={15}
        productValue={currentPrice ? Number(currentPrice) : 500}
        isDangerous={product.tags?.includes('hazmat') || false}
        requiresSpecialHandling={
          product.tags?.includes('fragile') || productType === 'microscope'
        }
      />

      {/* Smart Inventory Management */}
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        }
      >
        <SmartInventoryManagement
          productId={product.id}
          productTitle={product.title}
          currentPrice={currentPrice ? Number(currentPrice) : 500}
        />
      </Suspense>

      {/* AI Personalization Engine */}
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        }
      >
        <PersonalizationEngine currentProductId={product.id} />
      </Suspense>

      {/* Advanced Analytics Dashboard */}
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        }
      >
        <AdvancedAnalyticsDashboard />
      </Suspense>

      {/* Advanced Checkout Optimization */}
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        }
      >
        <AdvancedCheckoutOptimization />
      </Suspense>

      {/* Intelligent Search & Discovery */}
      <IntelligentSearchAndDiscovery />

      {/* Smart Pricing Engine */}
      <SmartPricingEngine />
    </div>
  );
}
