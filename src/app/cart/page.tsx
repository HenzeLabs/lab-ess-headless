'use client';

import { getCart } from '@/lib/cart';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { removeCartLineAction, updateCartLineAction } from './actions';
import { Button } from '@/components/ui/button';
import CartAnalyticsTracker from '@/components/analytics/CartAnalyticsTracker';
import TrustSignals from '@/components/TrustSignals';
import type { Cart } from '@/lib/types';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);

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

    const reveal: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    };

    const sectionObserver = new IntersectionObserver(reveal, {
      threshold: 0.2,
    });

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    return () => {
      sectionObserver.disconnect();
    };
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

  const subtotal =
    cart?.lines.edges.reduce(
      (acc, item) =>
        acc +
        parseFloat(item.node.merchandise.price.amount) * item.node.quantity,
      0,
    ) || 0;

  if (loading) {
    return (
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-center mb-16">Your Cart</h1>
          <p>Loading cart...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-center mb-16">Your Cart</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-section-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-center mb-16">
            Your Cart
          </h1>

          {analyticsItems.length > 0 && <CartAnalyticsTracker items={analyticsItems} />}

          <div
            ref={sectionRef}
            className="opacity-0 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 [&:not(.is-visible)]:translate-y-8"
          >
            {cart && cart.lines.edges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="md:col-span-2">
                  <ul className="divide-y divide-[hsl(var(--muted))]/20">
                    {cart.lines.edges.map((item) => {
                      const featuredImage =
                        item.node.merchandise.product.featuredImage;
                      const imageUrl = featuredImage?.url;
                      const imageAlt =
                        featuredImage?.altText ||
                        item.node.merchandise.product.title;

                      return (
                        <li key={item.node.id} className="flex py-8">
                          <div className="flex w-full items-start gap-4 rounded-lg border border-[hsl(var(--muted))]/30 bg-[hsl(var(--bg))] p-4 shadow-soft">
                            <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-[hsl(var(--muted))]/30 bg-[hsl(var(--bg))]">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={imageAlt}
                                  width={112}
                                  height={112}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted))]">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="ml-6 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-lg font-medium text-[hsl(var(--ink))]">
                                  <h3>
                                    <Link
                                      href={`/products/${item.node.merchandise.product.handle}`}
                                      className="hover:text-[hsl(var(--brand))]"
                                    >
                                      {item.node.merchandise.product.title}
                                    </Link>
                                  </h3>
                                  <p className="ml-4">
                                    {item.node.merchandise.price.amount}{' '}
                                    {item.node.merchandise.price.currencyCode}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-base">
                                <div className="flex items-center gap-4">
                                  <form action={updateCartLineAction} className="flex items-center">
                                    <input type="hidden" name="lineId" value={item.node.id} />
                                    <Button
                                      type="submit"
                                      name="quantity"
                                      value={Math.max(1, item.node.quantity - 1)}
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 transition-all duration-300 ease-out-soft"
                                      aria-label="Decrease quantity"
                                      disabled={item.node.quantity <= 1}
                                    >
                                      -
                                    </Button>
                                    <span className="mx-2 w-8 text-center text-base font-medium">
                                      {item.node.quantity}
                                    </span>
                                    <Button
                                      type="submit"
                                      name="quantity"
                                      value={item.node.quantity + 1}
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 transition-all duration-300 ease-out-soft"
                                      aria-label="Increase quantity"
                                    >
                                      +
                                    </Button>
                                  </form>

                                  <form action={removeCartLineAction}>
                                    <input type="hidden" name="lineId" value={item.node.id} />
                                    <Button
                                      type="submit"
                                      variant="link"
                                      className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand))] transition-all duration-300 ease-out-soft"
                                      aria-label={`Remove ${item.node.merchandise.product.title} from cart`}
                                    >
                                      Remove
                                    </Button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="bg-[hsl(var(--bg))] p-10 rounded-lg shadow-soft ring-1 ring-[hsl(var(--muted))]/15">
                  <h2 className="text-2xl font-semibold text-[hsl(var(--ink))]">
                    Order summary
                  </h2>
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-base text-[hsl(var(--muted))]">Subtotal</p>
                      <p className="text-base font-medium text-[hsl(var(--ink))]">
                        ${subtotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[hsl(var(--muted))]/20 pt-6">
                      <p className="text-lg font-medium text-[hsl(var(--ink))]">
                        Order total
                      </p>
                      <p className="text-lg font-medium text-[hsl(var(--ink))]">
                        ${subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-10">
                    <a
                      href={cart.checkoutUrl}
                      className="btn-primary w-full text-center transition-all duration-300 ease-out-soft"
                      aria-label="Proceed to checkout"
                      data-cart-checkout
                    >
                      Checkout
                    </a>
                  </div>
                  <div className="mt-8">
                    <TrustSignals />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-[hsl(var(--bg))] p-16 rounded-lg shadow-soft ring-1 ring-[hsl(var(--muted))]/15">
                <h2 className="text-2xl font-semibold text-[hsl(var(--ink))] mb-4">
                  Your cart is empty
                </h2>
                <p className="text-[hsl(var(--muted))] mb-8">
                  Add some products to get started.
                </p>
                <Link href="/" className="btn-primary transition-all duration-300 ease-out-soft">
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}