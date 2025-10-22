'use client';
import { trackAddToCart } from '@/lib/analytics';
import React, { useState, useTransition } from 'react';
import TrustBar from '@/components/product/TrustBar';
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

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.edges?.[0]?.node.id,
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const variants = product.variants?.edges?.map((edge) => edge.node) ?? [];

  // Extract brand from metafields
  const brand =
    product.metafields?.find((field) => field.key === 'brand')?.value ?? null;

  // Extract first sentence from description for tagline
  const getTagline = (html?: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence ? firstSentence.trim() + '.' : '';
  };

  const tagline = getTagline(product.descriptionHtml);

  // Check if product has multiple meaningful variants (not just "Default Title")
  const hasMultipleVariants =
    variants.length > 1 ||
    (variants.length === 1 && variants[0].title !== 'Default Title');

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
  const currentVariantTitle = selectedVariantData?.title ?? null;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setFeedback(null);
    setIsError(false);
    startTransition(async () => {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            variantId: selectedVariant,
            quantity: 1,
          }),
        });
        // Signal other parts of the app (e.g., header) to refresh cart count
        window.dispatchEvent(new CustomEvent('cart:updated'));
        trackAddToCart({
          id: product.id,
          name: product.title,
          price: currentPrice,
          currency: currentCurrency,
          quantity: 1,
          category: product.tags?.[0] ?? null,
          brand,
          variant: currentVariantTitle,
        });
        setFeedback('Added to cart successfully!');
        setIsError(false);
      } catch (e) {
        setFeedback('Error adding to cart');
        setIsError(true);
      }
    });
  };

  return (
    <>
      {/* Desktop/Tablet Layout */}
      <div className="sticky top-8 flex flex-col space-y-6">
        {/* Hero Section: Title + Tagline */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1
              className={`${textStyles.h1} leading-tight`}
              data-test-id="product-title"
            >
              {product.title}
            </h1>
            {tagline && (
              <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed">
                {tagline}
              </p>
            )}
          </div>

          {/* Price directly below title */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p
                  className={`${textStyles.h3} text-[hsl(var(--ink))]`}
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
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Free shipping over $300
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--brand))]"></div>
                <span
                  className="text-xs font-semibold text-[hsl(var(--brand))]"
                  data-test-id="product-stock"
                >
                  In Stock
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Variant Selector - Only show if product has multiple variants */}
        {hasMultipleVariants && (
          <div className="space-y-3">
            <label
              htmlFor="variant-select"
              className="text-sm font-semibold text-[hsl(var(--ink))]"
            >
              Select Option
            </label>
            <div className="relative">
              <select
                id="variant-select"
                className="w-full appearance-none rounded-xl border-2 border-border bg-background px-4 py-3.5 pr-10 text-sm font-medium text-foreground shadow-sm transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-4 focus:ring-[hsl(var(--brand))]/10"
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
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
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

        {/* Add to Cart Button (Desktop) */}
        <div className="space-y-4">
          <button
            type="button"
            className={`${buttonStyles.primary} w-full py-4 text-base font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            disabled={isPending || !selectedVariant}
            onClick={handleAddToCart}
            data-test-id="add-to-cart-button"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
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
                Adding to cart...
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>

          {feedback && (
            <div
              className={`${
                isError
                  ? 'border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
                  : 'border-[hsl(var(--brand))]/30 bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]'
              } rounded-lg border px-4 py-3 text-sm font-medium`}
              data-test-id="cart-feedback"
            >
              {feedback}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              or 4 interest-free payments of{' '}
              <span className="font-semibold text-[hsl(var(--ink))]">
                ${currentPrice ? (Number(currentPrice) / 4).toFixed(2) : '0.00'}
              </span>{' '}
              with <span className="font-semibold">Afterpay</span>
            </p>
          </div>
        </div>

        {/* Trust Bar */}
        <TrustBar />

        {/* Collapsible Product Description */}
        <div className="space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-background px-5 py-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-4 focus:ring-[hsl(var(--brand))]/10"
            onClick={() => setShowDescription((v) => !v)}
            aria-expanded={showDescription}
            aria-controls="product-description-panel"
          >
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-[hsl(var(--brand))]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Product Description
            </span>
            <svg
              className={`h-5 w-5 transition-transform ${
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
              className="rounded-xl border border-border/50 bg-muted/20 px-5 py-4 text-sm leading-relaxed text-[hsl(var(--ink))]"
              dangerouslySetInnerHTML={{
                __html: product.descriptionHtml ?? '',
              }}
              data-test-id="product-description"
            />
          )}
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/98 p-4 shadow-[0_-8px_16px_rgba(0,0,0,0.08)] backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Price
            </span>
            <span className="text-lg font-bold text-[hsl(var(--ink))]">
              ${currentPrice ? Number(currentPrice).toFixed(2) : '0.00'}
            </span>
          </div>
          <button
            type="button"
            className={`${buttonStyles.primary} flex-1 py-4 text-base font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all`}
            disabled={isPending || !selectedVariant}
            onClick={handleAddToCart}
            data-test-id="add-to-cart-button-mobile"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
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
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
