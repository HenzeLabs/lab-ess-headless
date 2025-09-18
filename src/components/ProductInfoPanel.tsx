'use client';
import { trackAddToCart } from '@/lib/analytics';
import React, { useState, useTransition } from 'react';
// using API route for cart mutations
import { buttonStyles } from '@/lib/ui';

type Variant = { id: string; title: string };

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
  const variants = product.variants?.edges?.map((edge) => edge.node) ?? [];
  const price = product.priceRange?.minVariantPrice?.amount ?? null;
  const currency = product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';

  return (
    <div className="sticky top-8 flex flex-col">
      <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl">
        {product.title}
      </h1>
      <p className="mt-6 text-2xl text-heading">
        {product.priceRange.minVariantPrice.amount}{' '}
        {product.priceRange.minVariantPrice.currencyCode}
      </p>
      {variants.length > 0 && (
        <div className="mt-8">
          <label
            htmlFor="variant-select"
            className="text-base font-medium text-heading"
          >
            Options
          </label>
          <select
            id="variant-select"
            className="mt-2 block w-full rounded-lg border border-[hsl(var(--border))] py-3 pl-4 pr-12 text-base focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-[hsl(var(--brand))] sm:text-sm"
            aria-label="Product options"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Collapsible Product Description */}
      <div className="mt-8">
        <button
          type="button"
          className="w-full flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-3 text-base font-semibold text-heading shadow-sm transition hover:bg-[hsl(var(--muted))]/10"
          onClick={() => setShowDescription((v) => !v)}
          aria-expanded={showDescription}
          aria-controls="product-description-panel"
        >
          Product Description
          <span
            className={`ml-2 transition-transform ${
              showDescription ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>
        {showDescription && (
          <div
            id="product-description-panel"
            className="mt-4 space-y-8 text-lg text-body/80 animate-fade-in"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? '' }}
          />
        )}
      </div>
      <button
        type="button"
        className={`${buttonStyles.primary} mt-12 w-full justify-center py-3 text-base`}
        disabled={isPending || !selectedVariant}
        onClick={() => {
          if (!selectedVariant) return;
          setFeedback(null);
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
              setFeedback('Added to cart!');
              trackAddToCart({
                id: product.id,
                name: product.title,
                price: price,
                currency: currency,
                quantity: 1,
                category: product.tags?.[0] ?? null,
              });
            } catch (e) {
              setFeedback('Error adding to cart');
            }
          });
        }}
      >
        {isPending ? 'Adding...' : 'Add to cart'}
      </button>
      {feedback && (
        <div className="mt-2 text-green-600 text-sm">{feedback}</div>
      )}
      <div className="mt-2 text-sm text-body/70">
        or 4 payments of $
        {(Number(product.priceRange.minVariantPrice.amount) / 4).toFixed(2)}{' '}
        with Afterpay
      </div>
    </div>
  );
}
