'use client';

import { getCart } from '@/lib/cart';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import CartAnalyticsTracker from '@/components/analytics/CartAnalyticsTracker';
import TrustSignals from '@/components/TrustSignals';
import type { Cart } from '@/lib/types';
import { textStyles } from '@/lib/ui';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        setError('Failed to load cart.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

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

  if (loading) {
    return (
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${textStyles.h1} mb-16`}>Your Cart</h1>
          <p>Loading cart...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${textStyles.h1} mb-16`}>Your Cart</h1>
          <p className="text-red-500" data-test-id="api-error-message">
            {error}
          </p>
        </div>
      </main>
    );
  }

  async function refreshCart() {
    const newCart = await getCart();
    setCart(newCart);
  }

  function handleQuantityChange(lineId: string, quantity: number) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lineId, quantity }),
        });
        if (res.ok) {
          const json = (await res.json()) as { cart: Cart | null };
          setCart(json.cart);
          // Signal other parts of the app (e.g., header) to refresh cart count
          window.dispatchEvent(new CustomEvent('cart:updated'));
        } else {
          await refreshCart();
        }
      } catch {
        await refreshCart();
      }
    });
  }

  function handleRemove(lineId: string) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lineId }),
        });
        if (res.ok) {
          const json = (await res.json()) as { cart: Cart | null };
          setCart(json.cart);
          // Signal other parts of the app (e.g., header) to refresh cart count
          window.dispatchEvent(new CustomEvent('cart:updated'));
        } else {
          await refreshCart();
        }
      } catch {
        await refreshCart();
      }
    });
  }

  return (
    <>
      <main
        id="main-content"
        className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`${textStyles.h1} mb-16`}>Your Cart</h1>

          {analyticsItems.length > 0 && (
            <CartAnalyticsTracker items={analyticsItems} />
          )}

          <div className="transition-all duration-700 ease-out opacity-100">
            {cart && cart.lines.edges.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-2">
                    <ul className="space-y-6">
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
                            <div className="flex w-full items-start gap-4 rounded-lg border border-[hsl(var(--border))]/60 bg-[hsl(var(--bg))] p-5 md:p-6">
                              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-[hsl(var(--border))]/60 bg-[hsl(var(--bg))]">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={imageAlt}
                                    fill
                                    sizes="112px"
                                    className="object-contain w-full h-full"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted))]">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div className="ml-6 flex flex-1 flex-col">
                                <div>
                                  <div className="flex items-start justify-between gap-4">
                                    <h3
                                      className={`${textStyles.h4} flex-1 min-w-0 text-lg md:text-xl`}
                                      data-test-id="cart-item-name"
                                    >
                                      <Link
                                        href={`/products/${item.node.merchandise.product.handle}`}
                                        className="hover:text-[hsl(var(--brand))] line-clamp-2"
                                      >
                                        {item.node.merchandise.product.title}
                                      </Link>
                                    </h3>
                                    <p
                                      className="shrink-0 text-base md:text-lg font-medium text-[hsl(var(--ink))] whitespace-nowrap text-right"
                                      data-test-id="cart-item-price"
                                    >
                                      {(() => {
                                        const amt =
                                          item.node.cost?.amountPerQuantity
                                            ?.amount ??
                                          item.node.merchandise.price.amount;
                                        const cur =
                                          item.node.cost?.amountPerQuantity
                                            ?.currencyCode ??
                                          item.node.merchandise.price
                                            .currencyCode;
                                        const val =
                                          typeof amt === 'number'
                                            ? amt
                                            : parseFloat(String(amt));
                                        return `${val.toFixed(2)} ${cur}`;
                                      })()}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-1 items-end justify-between text-base">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.node.id,
                                            Math.max(1, item.node.quantity - 1),
                                          )
                                        }
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 transition-all duration-300 ease-out-soft"
                                        aria-label="Decrease quantity"
                                        disabled={
                                          item.node.quantity <= 1 || isPending
                                        }
                                        data-test-id={`cart-item-decrease-quantity-${item.node.id}`}
                                      >
                                        -
                                      </Button>
                                      <span
                                        className="mx-2 w-8 text-center text-base font-medium"
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
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 transition-all duration-300 ease-out-soft"
                                        aria-label="Increase quantity"
                                        disabled={isPending}
                                        data-test-id={`cart-item-increase-quantity-${item.node.id}`}
                                      >
                                        +
                                      </Button>
                                    </div>

                                    <Button
                                      type="button"
                                      onClick={() => handleRemove(item.node.id)}
                                      variant="link"
                                      className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand))] transition-colors duration-200"
                                      aria-label={`Remove ${item.node.merchandise.product.title} from cart`}
                                      disabled={isPending}
                                      data-test-id="cart-item-remove"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <div className="bg-[hsl(var(--surface))] p-8 rounded-lg border border-[hsl(var(--border))]/60 lg:sticky lg:top-24 h-fit">
                      <h2 className={`${textStyles.h2} mb-6`}>Order summary</h2>
                      <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-base text-[hsl(var(--muted-foreground))]">
                            Subtotal
                          </p>
                          <p
                            className="text-base font-medium text-[hsl(var(--ink))]"
                            data-test-id="cart-subtotal"
                          >
                            {subtotalMoney
                              ? `${parseFloat(subtotalMoney.amount).toFixed(
                                  2,
                                )} ${subtotalMoney.currencyCode}`
                              : '$0.00'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-[hsl(var(--muted))]/20 pt-6">
                          <p className="text-lg md:text-xl font-semibold text-[hsl(var(--ink))]">
                            Order total
                          </p>
                          <p
                            className="text-lg md:text-xl font-semibold text-[hsl(var(--ink))]"
                            data-test-id="cart-total"
                          >
                            {totalMoney
                              ? `${parseFloat(totalMoney.amount).toFixed(2)} ${
                                  totalMoney.currencyCode
                                }`
                              : '$0.00'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-10">
                        <Button
                          asChild
                          className="w-full bg-accent text-[hsl(var(--bg))] hover:bg-accent-dark transition-colors duration-200"
                          aria-label="Proceed to checkout"
                          data-cart-checkout
                        >
                          <a
                            href={cart.checkoutUrl}
                            data-test-id="checkout-button"
                          >
                            Checkout
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 lg:mt-12">
                  <TrustSignals />
                </div>
              </>
            ) : (
              <div className="text-center bg-[hsl(var(--surface))] p-16 rounded-lg border border-[hsl(var(--border))]/60">
                <h2
                  className={`${textStyles.h2} mb-4`}
                  data-test-id="cart-empty-message"
                >
                  Your cart is empty
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">
                  Add some products to get started.
                </p>
                <Button
                  asChild
                  className="transition-all duration-300 ease-out-soft"
                >
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
