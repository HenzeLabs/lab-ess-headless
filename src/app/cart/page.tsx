import type { MenuItem } from "@/lib/types";
import { getSiteUrl } from "@/lib/siteUrl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { toAppHref } from "@/lib/links";

async function getCollections() {
  const baseUrl = getSiteUrl();
  const res = await fetch(`${baseUrl}/api/menu`, { cache: "no-store" });
  if (!res.ok) {
    console.error(`[getCollections] Error fetching /api/menu (${res.status})`);
    return [];
  }
  const data = await res.json();
  return (data.items || []).map((item: MenuItem) => ({
    handle: item.url
      ? toAppHref(item.url).replace("/collections/", "")
      : item.title.toLowerCase(),
    title: item.title,
    image: item.image?.url
      ? { url: item.image.url, altText: item.image.altText ?? "" }
      : null,
  }));
}

const mockCartItems = [
  {
    id: "1",
    title: "Microscope",
    handle: "microscope",
    featuredImage: {
      url: "/placeholders/product1.jpg",
      altText: "Microscope",
    },
    priceRange: {
      minVariantPrice: {
        amount: "150.00",
        currencyCode: "USD",
      },
    },
    quantity: 1,
  },
  {
    id: "2",
    title: "Centrifuge",
    handle: "centrifuge",
    featuredImage: {
      url: "/placeholders/product2.jpg",
      altText: "Centrifuge",
    },
    priceRange: {
      minVariantPrice: {
        amount: "300.00",
        currencyCode: "USD",
      },
    },
    quantity: 2,
  },
];

export default async function CartPage() {
  const collections = await getCollections();
  const subtotal = mockCartItems.reduce(
    (acc, item) =>
      acc + parseFloat(item.priceRange.minVariantPrice.amount) * item.quantity,
    0,
  );

  return (
    <>
      <Header collections={collections} />
      <main className="bg-koala-light-grey py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-koala-dark-grey sm:text-5xl text-center mb-16">
            Your Cart
          </h1>

          {mockCartItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <ul role="list" className="divide-y divide-koala-dark-grey/20">
                  {mockCartItems.map((product) => (
                    <li key={product.id} className="flex py-8">
                      <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-koala-dark-grey/20">
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText}
                          width={112}
                          height={112}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-6 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-lg font-medium text-koala-dark-grey">
                            <h3>
                              <a href={`/products/${product.handle}`}>
                                {product.title}
                              </a>
                            </h3>
                            <p className="ml-4">
                              {product.priceRange.minVariantPrice.amount}{" "}
                              {product.priceRange.minVariantPrice.currencyCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-base">
                          <p className="text-koala-dark-grey/80">
                            Qty {product.quantity}
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

              {/* Order summary */}
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
                  <button className="btn-primary w-full">Checkout</button>
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
