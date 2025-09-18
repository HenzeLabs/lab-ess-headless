import { getCart } from '@/lib/cart';
import Image from 'next/image';
import Link from 'next/link';

import { removeCartLineAction } from './actions';
import CartAnalyticsTracker from '@/components/analytics/CartAnalyticsTracker';

const PLACEHOLDER_IMG = '/placeholders/product1.jpg';

export default async function CartPage() {
  const cart = await getCart();

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

  return (
    <>
      <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(var(--ink))] sm:text-5xl text-center mb-16">
            Your Cart
          </h1>

          {analyticsItems.length > 0 && <CartAnalyticsTracker items={analyticsItems} />}

          {cart && cart.lines.edges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="md:col-span-2">
                <ul className="divide-y divide-[hsl(var(--muted))]/20">
                  {cart.lines.edges.map((item) => {
                    const featuredImage =
                      item.node.merchandise.product.featuredImage;
                    const imageUrl = featuredImage?.url || PLACEHOLDER_IMG;
                    const imageAlt =
                      featuredImage?.altText ||
                      item.node.merchandise.product.title;

                    return (
                      <li key={item.node.id} className="flex py-8">
                        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-[hsl(var(--muted))]/30 bg-[hsl(var(--bg))]">
                          <Image
                            src={imageUrl}
                            alt={imageAlt}
                            width={112}
                            height={112}
                            className="h-full w-full object-cover object-center"
                          />
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
                            <p className="text-[hsl(var(--muted))]">
                              Qty {item.node.quantity}
                            </p>

                            <form
                              action={removeCartLineAction}
                              className="flex"
                              data-cart-remove={item.node.id}
                            >
                              <input type="hidden" name="lineId" value={item.node.id} />
                              <button
                                type="submit"
                                className="font-medium text-[hsl(var(--brand))] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
                                aria-label={`Remove ${item.node.merchandise.product.title} from cart`}
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-[hsl(var(--bg))] p-10 rounded-lg shadow-sm ring-1 ring-[hsl(var(--muted))]/15">
                <h2 className="text-xl font-medium text-[hsl(var(--ink))]">
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
                    className="btn-primary w-full text-center"
                    aria-label="Proceed to checkout"
                    data-cart-checkout
                  >
                    Checkout
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center bg-[hsl(var(--bg))] p-16 rounded-lg shadow-sm ring-1 ring-[hsl(var(--muted))]/15">
              <h2 className="text-2xl font-medium text-[hsl(var(--ink))] mb-4">
                Your cart is empty
              </h2>
              <p className="text-[hsl(var(--muted))] mb-8">
                Add some products to get started.
              </p>
              <Link href="/" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
