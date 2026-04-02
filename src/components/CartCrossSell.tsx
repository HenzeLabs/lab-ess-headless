'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartContext } from '@/components/providers/CartContext';
import { trackAddToCart, trackSelectItem } from '@/lib/analytics';
import type { Cart } from '@/lib/types';

type CrossSellProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  variants?: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale?: boolean;
        price: { amount: string; currencyCode: string };
      };
    }[];
  };
};

export default function CartCrossSell() {
  const { cart, updateCartState } = useCartContext();
  const [products, setProducts] = useState<CrossSellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!cart || cart.lines.edges.length === 0) {
      setLoading(false);
      return;
    }

    const handles = cart.lines.edges.map(
      (e) => e.node.merchandise.product.handle,
    );
    const params = new URLSearchParams({
      handles: handles.join(','),
      exclude: handles.join(','),
      limit: '4',
    });

    fetch(`/api/cross-sell?${params}`)
      .then((res) => res.json())
      .then((data: { products: CrossSellProduct[] }) => {
        setProducts(data.products ?? []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [cart]);

  function handleAddToCart(product: CrossSellProduct) {
    const variant = product.variants?.edges?.[0]?.node;
    if (!variant) return;

    setAddingId(product.id);

    startTransition(async () => {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: variant.id,
            quantity: 1,
          }),
        });

        if (res.ok) {
          const json = (await res.json()) as { cart: Cart | null };
          if (json.cart) {
            updateCartState(json.cart);
          }

          // Analytics
          trackAddToCart({
            id: product.handle,
            name: product.title,
            price: product.priceRange.minVariantPrice.amount,
            currency: product.priceRange.minVariantPrice.currencyCode,
            quantity: 1,
          });

          // Brief success indicator
          setAddedId(product.id);
          setTimeout(() => setAddedId(null), 2000);
        }
      } catch (error) {
        console.error('Cross-sell add to cart failed:', error);
      } finally {
        setAddingId(null);
      }
    });
  }

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-10 lg:mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-[hsl(var(--ink))] mb-6">
        You May Also Like
      </h2>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 scrollbar-hide">
        {products.map((product) => {
          const price = product.priceRange?.minVariantPrice?.amount;
          const currencyCode =
            product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';
          const formattedPrice = price
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
              }).format(Number(price))
            : null;
          const imageUrl = product.featuredImage?.url;
          const imageAlt = product.featuredImage?.altText ?? product.title;
          const isAdding = addingId === product.id;
          const wasAdded = addedId === product.id;
          const hasVariant = (product.variants?.edges?.length ?? 0) > 0;

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-[260px] md:w-auto snap-start flex flex-col rounded-2xl border-2 border-border/50 bg-white shadow-md hover:shadow-lg hover:border-[hsl(var(--brand))]/30 transition-all duration-300 overflow-hidden"
            >
              <Link
                href={`/products/${product.handle}`}
                className="block"
                onClick={() =>
                  trackSelectItem(
                    {
                      id: product.handle,
                      name: product.title,
                      price,
                      currency: currencyCode,
                    },
                    'cart_cross_sell',
                  )
                }
              >
                <div className="flex h-40 w-full items-center justify-center bg-gray-50 p-4">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      width={160}
                      height={160}
                      className="h-full w-auto object-contain"
                      sizes="(max-width: 768px) 260px, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[hsl(var(--muted-foreground))]">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex flex-col flex-grow p-4">
                <Link href={`/products/${product.handle}`}>
                  <h3 className="text-sm font-bold text-[hsl(var(--ink))] line-clamp-2 hover:text-[hsl(var(--brand))] transition-colors">
                    {product.title}
                  </h3>
                </Link>

                {formattedPrice && (
                  <p className="mt-1 text-base font-bold text-[hsl(var(--brand))]">
                    {formattedPrice}
                  </p>
                )}

                <div className="mt-auto pt-3">
                  {hasVariant ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding || isPending}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        wasAdded
                          ? 'bg-green-600 text-white'
                          : 'bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand-dark))] hover:-translate-y-[1px] hover:shadow-md'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                    >
                      {wasAdded ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg
                            className="w-4 h-4"
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
                          Added
                        </span>
                      ) : isAdding ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg
                            className="animate-spin w-4 h-4"
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
                          Adding...
                        </span>
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                  ) : (
                    <Link
                      href={`/products/${product.handle}`}
                      className="block w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-center bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand-dark))] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
                    >
                      View Product
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
