import { getCart } from '@/lib/cart';
import type { MenuItem } from '@/lib/types';
import { getCollectionsQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default async function CartPage() {
  const collectionsResponse = await shopifyFetch<{
    collections: { edges: { node: MenuItem }[] };
  }>({ query: getCollectionsQuery });
  const collections = collectionsResponse.success
    ? collectionsResponse.data.collections.edges.map((edge) => edge.node)
    : [];
  const cart = await getCart();

  const subtotal =
    cart?.lines.edges.reduce(
      (acc, item) =>
        acc +
        parseFloat(item.node.merchandise.price.amount) * item.node.quantity,
      0,
    ) || 0;

  return (
    <>
      <Header collections={collections} />
      <main className="bg-koala-light-grey py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-koala-dark-grey sm:text-5xl text-center mb-16">
            Your Cart
          </h1>

          {cart && cart.lines.edges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="md:col-span-2">
                <ul role="list" className="divide-y divide-koala-dark-grey/20">
                  {cart.lines.edges.map((item) => (
                    <li key={item.node.id} className="flex py-8">
                      <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-koala-dark-grey/20">
                        <Image
                          src={item.node.merchandise.product.featuredImage.url}
                          alt={
                            item.node.merchandise.product.featuredImage.altText
                          }
                          width={112}
                          height={112}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-6 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-lg font-medium text-koala-dark-grey">
                            <h3>
                              <a
                                href={`/products/${item.node.merchandise.product.handle}`}
                              >
                                {item.node.merchandise.product.title}
                              </a>
                            </h3>
                            <p className="ml-4">
                              {item.node.merchandise.price.amount}{' '}
                              {item.node.merchandise.price.currencyCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-base">
                          <p className="text-koala-dark-grey/80">
                            Qty {item.node.quantity}
                          </p>

                          <div className="flex">
                            <button
                              type="button"
                              className="font-medium text-koala-green hover:text-opacity-80"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-10 rounded-lg shadow-md">
                <h2 className="text-xl font-medium text-koala-dark-grey">
                  Order summary
                </h2>
                <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-base text-koala-dark-grey/80">
                      Subtotal
                    </p>
                    <p className="text-base font-medium text-koala-dark-grey">
                      ${subtotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-koala-dark-grey/20 pt-6">
                    <p className="text-lg font-medium text-koala-dark-grey">
                      Order total
                    </p>
                    <p className="text-lg font-medium text-koala-dark-grey">
                      ${subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-10">
                  <a
                    href={cart.checkoutUrl}
                    className="btn-primary w-full text-center"
                  >
                    Checkout
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center bg-white p-16 rounded-lg shadow-md">
              <h2 className="text-2xl font-medium text-koala-dark-grey mb-4">
                Your cart is empty
              </h2>
              <p className="text-koala-dark-grey/80 mb-8">
                Add some products to get started.
              </p>
              <Link href="/" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
