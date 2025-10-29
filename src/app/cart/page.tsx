'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import CartAnalyticsTracker from '@/components/analytics/CartAnalyticsTracker';
import TrustSignals from '@/components/TrustSignals';
import type { Cart } from '@/lib/types';
import { textStyles } from '@/lib/ui';
import { useCartContext } from '@/components/providers/CartContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function CartPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Use cart directly from context - it's the single source of truth
  const { cart, updateCartState, refreshCart, isRefreshing } = useCartContext();

  // Initial load - just use context cart, or trigger refresh if needed
  useEffect(() => {
    // If context doesn't have cart yet, trigger a refresh
    if (!cart && !isRefreshing) {
      refreshCart({ silent: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const analyticsItems =
    cart?.lines.edges.map((edge) => ({
      lineId: edge.node.id,
      currency: edge.node.merchandise.price.currencyCode,
      item: {
        id: edge.node.merchandise.product.handle,
        name: edge.node.merchandise.product.title,
        price: edge.node.merchandise.price.amount,
        quantity: edge.node.quantity,
        currency: edge.node.merchandise.price.currencyCode,
      },
    })) ?? [];

  const subtotalMoney = cart?.cost?.subtotalAmount;
  const totalMoney = cart?.cost?.totalAmount ?? subtotalMoney;

  // Show loading state while cart is being refreshed
  if (isRefreshing && !cart) {
    return (
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${textStyles.h1} mb-16`}>Your Cart</h1>
          <p>Loading cart...</p>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${textStyles.h1} mb-16`}>Your Cart</h1>
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-block"
            role="alert"
            data-test-id="api-error-message"
          >
            <p className="font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 underline hover:text-red-800 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  async function handleCheckout() {
    startTransition(async () => {
      try {
        // Fire analytics event
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'begin_checkout', {
            currency: cart?.cost?.totalAmount?.currencyCode || 'USD',
            value: parseFloat(cart?.cost?.totalAmount?.amount || '0'),
            items: analyticsItems.map((item) => item.item),
          });
        }

        // Get secure checkout URL from API
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId: cart?.id,
            returnUrl: `${window.location.origin}/thank-you`,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create checkout');
        }

        const { checkoutUrl, totalQuantity, totalAmount } =
          await response.json();

        // Log checkout redirect
        console.log('Redirecting to checkout:', {
          totalQuantity,
          totalAmount: totalAmount.amount,
          currency: totalAmount.currencyCode,
        });

        // Redirect to Shopify checkout
        window.location.href = checkoutUrl;
      } catch (error) {
        console.error('Checkout error:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to process checkout. Please try again.',
        );
      }
    });
  }

  function handleQuantityChange(lineId: string, quantity: number) {
    startTransition(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lineId, quantity }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = (await res.json()) as { cart: Cart | null };
          // Update the global cart context - this updates everywhere including this page
          updateCartState(json.cart);
        } else {
          await refreshCart();
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Cart quantity update failed:', error);
        await refreshCart();
      }
    });
  }

  function handleRemove(lineId: string) {
    startTransition(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lineId }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = (await res.json()) as { cart: Cart | null };

          // Update context with the new cart state
          updateCartState(json.cart ?? null);
        } else {
          await refreshCart();
        }
      } catch (error) {
        clearTimeout(timeoutId);
        await refreshCart();
      }
    });
  }

  return (
    <>
      <main
        id="main-content"
        className="bg-background min-h-screen"
      >
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/5 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-8 md:py-10">
          {/* Animated background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}
          />

          {/* Glowing orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--brand))]/10 rounded-full blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-4 py-1.5 border border-[hsl(var(--brand))]/20">
                <svg className="w-4 h-4 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                  Shopping Cart
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--ink))] tracking-tight">
                Your Cart
              </h1>
              {cart && cart.lines.edges.length > 0 && (
                <p className="text-base text-[hsl(var(--body))]">
                  {cart.lines.edges.reduce((acc, item) => acc + item.node.quantity, 0)} {cart.lines.edges.reduce((acc, item) => acc + item.node.quantity, 0) === 1 ? 'item' : 'items'} in your cart
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

          {error && cart && (
            <div
              className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start justify-between"
              role="alert"
              data-test-id="checkout-error"
            >
              <div className="flex-1">
                <p className="font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 font-bold"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {analyticsItems.length > 0 && (
            <CartAnalyticsTracker items={analyticsItems} />
          )}

          <div className="transition-all duration-700 ease-out opacity-100 max-w-7xl mx-auto">
            {cart && cart.lines.edges.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                  <div>
                    <ul className="space-y-4">
                      {cart.lines.edges.map((item) => {
                        const featuredImage =
                          item.node.merchandise.product.featuredImage;
                        const imageUrl = featuredImage?.url;
                        const imageAlt =
                          featuredImage?.altText ||
                          item.node.merchandise.product.title;

                        return (
                          <li
                            key={item.node.id}
                            className="flex animate-in fade-in slide-in-from-bottom-4"
                            data-test-id="cart-item"
                          >
                            <div className="flex w-full items-start gap-4 md:gap-6 rounded-2xl border-2 border-border/50 bg-white p-4 md:p-6 shadow-md hover:shadow-lg hover:border-[hsl(var(--brand))]/30 transition-all duration-300">
                              <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-xl border border-border/30 bg-gray-50">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={imageAlt}
                                    fill
                                    sizes="128px"
                                    className="object-contain w-full h-full p-2"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted))]">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-1 flex-col gap-3">
                                <div>
                                  <div className="flex items-start justify-between gap-4">
                                    <h3
                                      className="flex-1 min-w-0 text-base md:text-lg font-bold text-[hsl(var(--ink))]"
                                      data-test-id="cart-item-name"
                                    >
                                      <Link
                                        href={`/products/${item.node.merchandise.product.handle}`}
                                        className="hover:text-[hsl(var(--brand))] transition-colors line-clamp-2"
                                      >
                                        {item.node.merchandise.product.title}
                                      </Link>
                                    </h3>
                                    <p
                                      className="shrink-0 text-lg md:text-xl font-bold text-[hsl(var(--brand))] whitespace-nowrap text-right"
                                      data-test-id="cart-item-price"
                                    >
                                      {(() => {
                                        const amt =
                                          item.node.cost?.amountPerQuantity
                                            ?.amount ??
                                          item.node.merchandise.price.amount;
                                        const val =
                                          typeof amt === 'number'
                                            ? amt
                                            : parseFloat(String(amt));
                                        return `$${val.toFixed(2)}`;
                                      })()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center border-2 border-border/50 rounded-lg overflow-hidden bg-gray-50">
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.node.id,
                                            Math.max(1, item.node.quantity - 1),
                                          )
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-none hover:bg-[hsl(var(--brand))]/10 hover:text-[hsl(var(--brand))]"
                                        aria-label="Decrease quantity"
                                        disabled={
                                          item.node.quantity <= 1 || isPending
                                        }
                                        data-test-id={`cart-item-decrease-quantity-${item.node.id}`}
                                      >
                                        -
                                      </Button>
                                      <span
                                        className="w-10 text-center text-base font-semibold bg-white"
                                        data-test-id="cart-item-quantity"
                                      >
                                        {item.node.quantity}
                                      </span>
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.node.id,
                                            item.node.quantity + 1,
                                          )
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-none hover:bg-[hsl(var(--brand))]/10 hover:text-[hsl(var(--brand))]"
                                        aria-label="Increase quantity"
                                        disabled={isPending}
                                        data-test-id={`cart-item-increase-quantity-${item.node.id}`}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>

                                  <Button
                                    type="button"
                                    onClick={() => handleRemove(item.node.id)}
                                    variant="ghost"
                                    className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                                    aria-label={`Remove ${item.node.merchandise.product.title} from cart`}
                                    disabled={isPending}
                                    data-test-id="cart-item-remove"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-[hsl(var(--brand))]/20 shadow-lg lg:sticky lg:top-24 h-fit">
                      <div>
                        {/* Header */}
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-[hsl(var(--ink))] mb-1">Order Summary</h2>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">Review before checkout</p>
                        </div>

                        {/* Pricing breakdown */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between py-3 px-4 bg-[hsl(var(--muted))]/20 rounded-xl">
                            <p className="text-sm font-medium text-[hsl(var(--body))]">
                              Subtotal
                            </p>
                            <p
                              className="text-lg font-bold text-[hsl(var(--ink))]"
                              data-test-id="cart-subtotal"
                            >
                              {subtotalMoney
                                ? `$${parseFloat(subtotalMoney.amount).toFixed(2)}`
                                : '$0.00'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between py-4 px-5 bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] rounded-2xl shadow-xl">
                            <div>
                              <p className="text-sm font-semibold text-white/90 mb-0.5">
                                Order Total
                              </p>
                              <p className="text-xs text-white/70">
                                Tax at checkout
                              </p>
                            </div>
                            <p
                              className="text-3xl font-bold text-white"
                              data-test-id="cart-total"
                            >
                              {totalMoney
                                ? `$${parseFloat(totalMoney.amount).toFixed(2)}`
                                : '$0.00'}
                            </p>
                          </div>
                        </div>

                        {/* Checkout button */}
                        <Button
                          onClick={handleCheckout}
                          disabled={isPending}
                          className="w-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white hover:from-[hsl(var(--brand-dark))] hover:to-[hsl(var(--brand))] py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                          aria-label="Proceed to checkout"
                          data-cart-checkout
                          data-test-id="checkout-button"
                        >
                          {isPending ? (
                            <span
                              className="flex items-center justify-center"
                              data-test-id="checkout-loading"
                            >
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Secure Checkout
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          )}
                        </Button>

                        {/* Simple trust note */}
                        <p className="mt-4 text-xs text-center text-[hsl(var(--muted-foreground))]">
                          <svg className="w-4 h-4 inline mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Secure SSL encrypted checkout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Signals moved below cart */}
                <div className="mt-10 lg:mt-12">
                  <TrustSignals />
                </div>
              </>
            ) : (
              <div className="text-center bg-white p-16 md:p-20 rounded-2xl border-2 border-border/50 shadow-lg max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[hsl(var(--muted))]/20 rounded-full mb-6">
                  <svg className="w-10 h-10 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2
                  className="text-3xl font-bold text-[hsl(var(--ink))] mb-3"
                  data-test-id="empty-cart"
                >
                  Your cart is empty
                </h2>
                <p className="text-lg text-[hsl(var(--body))] mb-8">
                  Explore our collections and add some lab equipment to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand-dark))] px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Link href="/collections">Browse Collections</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="px-8 py-6 text-base font-semibold rounded-xl border-2 hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))] transition-all duration-300"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
