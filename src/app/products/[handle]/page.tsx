import { notFound } from 'next/navigation';
import Image from 'next/image';

import TrustSignals from '@/components/TrustSignals';
import DeliveryInfo from '@/components/DeliveryInfo';
import StarRating from '@/components/StarRating';
import DeliveryCalculator from '@/components/DeliveryCalculator';
import RelatedProducts from '@/components/RelatedProducts';
import type { Product } from '@/lib/types';
import { getProductByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';

export const revalidate = 60;

export default async function ProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}) {
  // Next.js 15: params is a Promise
  const { handle } = await paramsPromise;
  if (typeof handle !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(handle))
    notFound();

  const productResponse = await shopifyFetch<{ product: Product }>({
    query: getProductByHandleQuery,
    variables: { handle },
  });

  if (!productResponse.success || !productResponse.data?.product) {
    notFound();
  }

  const product = productResponse.data.product;

  const images = product.images?.edges?.map((edge) => edge.node) || [];
  const variants = product.variants?.edges?.map((edge) => edge.node) || [];

  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.featuredImage?.url ? [product.featuredImage.url] : [],
    description: product.description ?? '',
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
      price: product.priceRange?.minVariantPrice?.amount ?? '',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
    },
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: product.title, url: `/products/${product.handle}` },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${crumb.url}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main id="main-content" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            <div className="flex flex-col gap-6">
              <div className="w-full aspect-square bg-background rounded-lg overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={
                      product.featuredImage?.url ?? '/placeholder-product.jpg'
                    }
                    alt={product.featuredImage?.altText ?? product.title}
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {images
                  .slice(0, 4)
                  .map(
                    (
                      image: { url: string; altText?: string },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="aspect-square bg-background rounded-lg overflow-hidden"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={image.url}
                            alt={image.altText || product.title}
                            width={150}
                            height={150}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>

            <div className="flex flex-col sticky top-8">
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                {product.title}
              </h1>
              <div className="mt-4 mb-2">
                <StarRating rating={5} count={1234} />
              </div>
              <p className="mt-6 text-2xl text-foreground">
                {product.priceRange.minVariantPrice.amount}{' '}
                {product.priceRange.minVariantPrice.currencyCode}
              </p>
              <div className="mt-6">
                <h2
                  className="text-xl font-bold text-foreground mb-4"
                  id="trust-signals-heading"
                >
                  Why Shop With Us?
                </h2>
                <TrustSignals />
              </div>
              <div className="mt-8">
                <label
                  htmlFor="variant-select"
                  className="text-base text-foreground font-medium"
                >
                  Options
                </label>
                <select
                  id="variant-select"
                  className="mt-2 block w-full pl-4 pr-12 py-3 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg"
                  aria-label="Product options"
                >
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn-primary w-full mt-12">
                Add to cart
              </button>
              <div className="text-sm text-muted-foreground mt-2">
                or 4 payments of $
                {(
                  Number(product.priceRange.minVariantPrice.amount) / 4
                ).toFixed(2)}{' '}
                with Afterpay
              </div>
              <div className="mt-8">
                <DeliveryCalculator />
              </div>
            </div>
          </div>
        </div>

        <section className="py-12 bg-background border-b">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">
              Product Description
            </h2>
            <div
              className="text-lg text-muted-foreground space-y-8"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </section>

        <DeliveryInfo />
        {/* ...existing code... */}
        <RelatedProducts />
      </main>
    </>
  );
}
