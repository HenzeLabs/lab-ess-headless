import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Remove dynamic import from server component

import type { Product } from '@/lib/types';
import { getProductByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import ProductInfoPanelClient from './ProductInfoPanelClient';

export const revalidate = 60;

async function getProduct(handle: string): Promise<Product | null> {
  if (typeof handle !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(handle)) {
    return null;
  }

  try {
    const response = await shopifyFetch<{ product: Product | null }>({
      query: getProductByHandleQuery,
      variables: { handle },
    });
    return response.data.product ?? null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await paramsPromise;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found | Lab Essentials',
      robots: { index: false, follow: true },
    };
  }

  const url = absoluteUrl(`/products/${product.handle}`);
  const description = stripHtml(product.descriptionHtml).slice(0, 160);
  const image = product.featuredImage?.url
    ? [
        {
          url: product.featuredImage.url,
          alt: product.featuredImage.altText ?? product.title,
        },
      ]
    : undefined;

  return {
    title: `${product.title} | Lab Essentials`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${product.title} | Lab Essentials`,
      description,
      url,
      type: 'website',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Lab Essentials`,
      description,
      images: image?.map((item) => item.url),
    },
  };
}

export default async function ProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await paramsPromise;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const images = product.images?.edges?.map((edge) => edge.node) ?? [];

  const productUrl = absoluteUrl(`/products/${product.handle}`);
  const description = stripHtml(product.descriptionHtml);
  const price = product.priceRange?.minVariantPrice?.amount ?? null;
  const currency = product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';
  const analyticsProduct = {
    id: product.id,
    name: product.title,
    price,
    currency,
    category: product.tags?.[0] ?? null,
  };
  // ProductInfoPanel will be imported via a client wrapper

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.featuredImage?.url ? [product.featuredImage.url] : undefined,
    description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Lab Essentials',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
      price: product.priceRange?.minVariantPrice?.amount ?? '',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: absoluteUrl('/collections'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(productJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />
      <ProductViewTracker product={analyticsProduct} currency={currency} />
      <main
        id="main-content"
        className="bg-background py-12 lg:py-24"
        role="main"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 md:gap-24 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-background border border-border/50">
                <div className="relative h-full w-full">
                  {product.featuredImage?.url ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage?.altText ?? product.title}
                      width={600}
                      height={600}
                      className="h-full w-full object-contain p-6"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/20">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <svg
                            className="w-8 h-8 text-muted-foreground"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          No image available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-xl bg-background border border-border/30"
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src={image.url}
                          alt={image.altText || product.title}
                          width={150}
                          height={150}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Use client wrapper for ProductInfoPanel */}
            <ProductInfoPanelClient
              product={{
                id: product.id,
                title: product.title,
                priceRange: product.priceRange,
                tags: product.tags,
                variants: product.variants ?? { edges: [] },
                descriptionHtml: product.descriptionHtml,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
