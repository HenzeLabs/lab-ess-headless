'use client';

import React, { useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';

import { buttonStyles, layout, textStyles } from '@/lib/ui';
import { trackAddToCart } from '@/lib/analytics';
import { useCartContext } from '@/components/providers/CartContext';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  image: string;
  lifestyleImage?: string; // Added lifestyleImage
  variantId?: string;
}

interface FeaturedProductsProps {
  products?: Product[];
  title?: string;
}

const ProductSkeleton = () => (
  <div className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--muted))]/20 bg-[hsl(var(--bg))] shadow-sm animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))]/40 to-[hsl(var(--muted))]/20" />
    <div className="p-6">
      <div className="mb-2 h-6 rounded bg-[hsl(var(--muted))]/40" />
      <div className="mb-4 h-4 w-3/4 rounded bg-[hsl(var(--muted))]/40" />
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-20 rounded bg-[hsl(var(--muted))]/40" />
      </div>
      <div className="h-12 rounded-full bg-[hsl(var(--muted))]/40" />
    </div>
  </div>
);

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  title = 'Featured Product',
  products = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPending, startTransition] = useTransition();
  const { cartId, updateCartState } = useCartContext();

  const resolveVariantId = (product: Product): string | null => {
    if (
      product.variantId &&
      product.variantId.startsWith('gid://shopify/ProductVariant/')
    ) {
      return product.variantId;
    }
    if (product.id?.startsWith('gid://shopify/ProductVariant/')) {
      return product.id;
    }
    return null;
  };

  const quickAdd = async (
    product: Product,
    priceValue: number | null,
    currencyCode: string | null,
  ) => {
    const merchandiseId = resolveVariantId(product);
    if (!merchandiseId) {
      throw new Error(
        `Unable to add "${product.title}" to cart: missing variantId`,
      );
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cartId: cartId ?? undefined,
        lines: [
          {
            merchandiseId,
            quantity: 1,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error ??
          `Unable to add "${product.title}" to cart (status ${response.status})`,
      );
    }

    const data = await response.json();
    if (!data.cart) {
      throw new Error('Cart not returned in response.');
    }

    updateCartState(data.cart);
    window.dispatchEvent(new CustomEvent('cart:updated'));

    trackAddToCart({
      id: product.id,
      name: product.title,
      price: Number.isFinite(priceValue ?? NaN) ? priceValue ?? undefined : undefined,
      quantity: 1,
      currency: currencyCode ?? undefined,
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add(
                'animate-in',
                'fade-in',
                'slide-in-from-bottom-5',
              );
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 },
    );

    productRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [products]);

  return (
    <section ref={containerRef} className="bg-[hsl(var(--bg))]">
      <div className={`${layout.container} ${layout.section}`}>
        <h2 className={`${textStyles.heading} mb-12 text-center`}>{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0
            ? Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={`skeleton-${index}`} />
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  ref={(el) => {
                    productRefs.current[index] = el;
                  }}
                  className="opacity-0 duration-700"
                >
                  {index === 0 ? (
                    <div className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--muted))]/20 bg-[hsl(var(--bg))] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl col-span-full lg:col-span-2 row-span-2 grid grid-cols-1 lg:grid-cols-2">
                      {/* Product Image */}
                      <Link
                        href={`/products/${product.handle}`}
                        className="relative aspect-square lg:aspect-auto overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))]/20 to-[hsl(var(--muted))]/10"
                      >
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={600}
                          height={600}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </Link>
                      {/* Lifestyle Image */}
                      {product.lifestyleImage && (
                        <Link
                          href={`/products/${product.handle}`}
                          className="relative aspect-square lg:aspect-auto overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))]/20 to-[hsl(var(--muted))]/10 hidden lg:block"
                        >
                          <Image
                            src={product.lifestyleImage}
                            alt={`${product.title} lifestyle`}
                            width={600}
                            height={600}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </Link>
                      )}
                      <div className="p-6 lg:col-span-2">
                        {/* Title */}
                        <Link href={`/products/${product.handle}`}>
                          <h3 className="text-2xl font-semibold text-[hsl(var(--ink))] mb-2 line-clamp-2 transition-colors group-hover:text-[hsl(var(--brand))]">
                            {product.title}
                          </h3>
                        </Link>
                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[hsl(var(--ink))]">
                              {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-base text-[hsl(var(--muted))] line-through">
                                {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                          {product.compareAtPrice && (
                            <span className="rounded-full bg-[hsl(var(--brand))]/10 px-2 py-1 text-sm font-medium text-[hsl(var(--brand))]">
                              Save{' '}
                              {Math.round(
                                ((parseFloat(
                                  product.compareAtPrice.replace(
                                    /[^0-9.]/g,
                                    '',
                                  ),
                                ) -
                                  parseFloat(
                                    product.price.replace(/[^0-9.]/g, ''),
                                  )) /
                                  parseFloat(
                                    product.compareAtPrice.replace(
                                      /[^0-9.]/g,
                                      '',
                                    ),
                                  )) *
                                  100,
                              )}
                              %
                            </span>
                          )}
                        </div>
                        {/* Add to Cart Button */}
                        <button
                          type="button"
                          className={`${buttonStyles.primary} w-full rounded-xl py-3 transition-transform duration-300 hover:scale-[1.02] active:scale-95 group-hover:shadow-lift`}
                          onClick={() => {
                            const priceValue = Number.parseFloat(
                              product.price.replace(/[^0-9.]/g, ''),
                            );
                            const currencyMatch =
                              product.price.match(/([A-Z]{3})$/);
                            startTransition(async () => {
                              try {
                                await quickAdd(
                                  product,
                                  Number.isFinite(priceValue)
                                    ? priceValue
                                    : null,
                                  currencyMatch ? currencyMatch[1] : null,
                                );
                              } catch (e) {
                                console.error('Error adding to cart:', e);
                              }
                            });
                          }}
                          disabled={isPending}
                          data-test-id="add-to-cart-button"
                        >
                          {isPending ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--muted))]/20 bg-[hsl(var(--bg))] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-[hsl(var(--border))] bg-surface/90 p-2 text-heading shadow-subtle transition hover:bg-surface"
                            aria-label="Add to favorites"
                          >
                            <HeartIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-[hsl(var(--border))] bg-surface/90 p-2 text-heading shadow-subtle transition hover:bg-surface"
                            aria-label="Quick view"
                          >
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Product Image */}
                      <Link href={`/products/${product.handle}`}>
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))]/20 to-[hsl(var(--muted))]/10">
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                      </Link>

                      <div className="p-6">
                        {/* Title */}
                        <Link href={`/products/${product.handle}`}>
                          <h3 className="text-lg font-semibold text-[hsl(var(--ink))] mb-2 line-clamp-2 transition-colors group-hover:text-[hsl(var(--brand))]">
                            {product.title}
                          </h3>
                        </Link>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[hsl(var(--ink))]">
                              {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-[hsl(var(--muted))] line-through">
                                {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                          {product.compareAtPrice && (
                            <span className="rounded-full bg-[hsl(var(--brand))]/10 px-2 py-1 text-sm font-medium text-[hsl(var(--brand))]">
                              Save{' '}
                              {Math.round(
                                ((parseFloat(
                                  product.compareAtPrice.replace(
                                    /[^0-9.]/g,
                                    '',
                                  ),
                                ) -
                                  parseFloat(
                                    product.price.replace(/[^0-9.]/g, ''),
                                  )) /
                                  parseFloat(
                                    product.compareAtPrice.replace(
                                      /[^0-9.]/g,
                                      '',
                                    ),
                                  )) *
                                  100,
                              )}
                              %
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          type="button"
                          className={`${buttonStyles.primary} w-full rounded-xl py-3 transition-transform duration-300 hover:scale-[1.02] active:scale-95 group-hover:shadow-lift`}
                          onClick={() => {
                            const priceValue = Number.parseFloat(
                              product.price.replace(/[^0-9.]/g, ''),
                            );
                            const currencyMatch =
                              product.price.match(/([A-Z]{3})$/);
                            startTransition(async () => {
                              try {
                                await quickAdd(
                                  product,
                                  Number.isFinite(priceValue)
                                    ? priceValue
                                    : null,
                                  currencyMatch ? currencyMatch[1] : null,
                                );
                              } catch (e) {
                                console.error('Error adding to cart:', e);
                              }
                            });
                          }}
                          disabled={isPending}
                          data-test-id="add-to-cart-button"
                        >
                          {isPending ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
