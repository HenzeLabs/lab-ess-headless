'use client';
import { trackAddToCart } from '@/lib/analytics';
import React, { useState, useTransition, useOptimistic } from 'react';
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
    metafields?: Array<{
      namespace: string;
      key: string;
      value: string;
      type: string;
    }>;
  };
};

export default function OptimizedProductInfoPanel({
  product,
}: ProductInfoPanelProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.edges?.[0]?.node.id,
  );
  const [isPending, startTransition] = useTransition();

  // Optimistic UI state for instant feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    { status: 'idle' as 'idle' | 'adding' | 'success' | 'error', message: '' },
    (
      _state,
      newStatus: {
        status: 'idle' | 'adding' | 'success' | 'error';
        message: string;
      },
    ) => newStatus,
  );

  const variants = product.variants?.edges?.map((edge) => edge.node) ?? [];
  const selectedVariantData = variants.find((v) => v.id === selectedVariant);
  const currentPrice =
    selectedVariantData?.price?.amount ??
    product.priceRange?.minVariantPrice?.amount;
  const currentCurrency = selectedVariantData?.price?.currencyCode ?? 'USD';

  const handleAddToCart = async () => {
    // INSTANT FEEDBACK: Update UI immediately (INP < 50ms)
    setOptimisticState({ status: 'adding', message: 'Adding to cart...' });

    // Track analytics in parallel (non-blocking)
    trackAddToCart({
      id: product.id,
      name: product.title,
      price: currentPrice,
      currency: currentCurrency,
      quantity: 1,
      category: product.tags?.[0] ?? null,
      brand: product.metafields?.find((f) => f.key === 'brand')?.value ?? null,
      variant: selectedVariantData?.title ?? null,
    });

    startTransition(async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: selectedVariant,
            quantity: 1,
          }),
        });

        if (!response.ok) throw new Error('Failed to add to cart');

        // SUCCESS: Show confirmation for 2 seconds
        setOptimisticState({ status: 'success', message: '✓ Added to cart!' });

        // Auto-hide success message
        setTimeout(() => {
          setOptimisticState({ status: 'idle', message: '' });
        }, 2000);
      } catch (error) {
        // ERROR: Show error state
        setOptimisticState({
          status: 'error',
          message: 'Failed to add. Try again?',
        });

        // Auto-hide error after 3 seconds
        setTimeout(() => {
          setOptimisticState({ status: 'idle', message: '' });
        }, 3000);
      }
    });
  };

  return (
    <div className="sticky top-8 flex flex-col space-y-6">
      {/* Product Info */}
      <div className="space-y-4">
        <h1 className={`${textStyles.h1}`}>{product.title}</h1>
        <p className={`${textStyles.h3} text-foreground`}>
          $
          {currentPrice
            ? Number(currentPrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : 'Price not available'}
        </p>
      </div>

      {/* Variant Selector */}
      {variants.length > 0 && (
        <select
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/50 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.title} - ${Number(variant.price.amount).toFixed(2)}
            </option>
          ))}
        </select>
      )}

      {/* OPTIMIZED Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isPending || optimisticState.status === 'adding'}
        className={`
          ${buttonStyles.primary}
          relative w-full px-8 py-4 text-base font-semibold
          transition-all duration-200
          ${
            optimisticState.status === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : optimisticState.status === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : ''
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        data-test-id="add-to-cart-button"
      >
        {/* Button content with loading state */}
        <span className="flex items-center justify-center gap-2">
          {optimisticState.status === 'adding' && (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {optimisticState.status === 'success' && (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {optimisticState.message || 'Add to Cart'}
        </span>
      </button>

      {/* Stock Status */}
      <p
        className={`${textStyles.bodySmall} text-[hsl(var(--brand))] text-center`}
      >
        In stock • Ships in 1-2 business days
      </p>
    </div>
  );
}
