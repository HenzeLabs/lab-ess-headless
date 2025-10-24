import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { Product } from '@/lib/types';
import { getProductByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';
import { layout } from '@/lib/ui';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import ProductInfoPanelClient from './ProductInfoPanelClient';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductAccordions from '@/components/product/ProductAccordions';
import TechnicalSummaryCard from '@/components/product/TechnicalSummaryCard';
import ProductHighlights from '@/components/product/ProductHighlights';
import ProductComparisonCTA from '@/components/product/ProductComparisonCTA';
import Breadcrumbs from '@/components/Breadcrumbs';

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

  // Ensure metafields is always an array (defensive null check)
  const safeMetafields = product.metafields ?? [];

  const images = product.images?.edges?.map((edge) => edge.node) ?? [];

  const productUrl = absoluteUrl(`/products/${product.handle}`);
  const description = stripHtml(product.descriptionHtml);
  const price = product.priceRange?.minVariantPrice?.amount ?? null;
  const currency = product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';

  // Extract brand from metafields
  const brand =
    safeMetafields.find((field) => field && field.key === 'brand')?.value ??
    null;

  const analyticsProduct = {
    id: product.id,
    name: product.title,
    price,
    currency,
    category: product.tags?.[0] ?? null,
    brand,
    variant: null, // Will be set when variant is selected
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
        className="bg-background py-8 md:py-12 lg:py-16"
        role="main"
      >
        {/* Breadcrumbs */}
        <div className={layout.container}>
          <Breadcrumbs
            items={(() => {
              const breadcrumbItems = [];

              // Add collection if available
              const collection = product.collections?.edges?.[0]?.node;
              if (collection) {
                breadcrumbItems.push({
                  label: collection.title,
                  href: `/collections/${collection.handle}`,
                });
              } else {
                // Fallback to generic Collections
                breadcrumbItems.push({
                  label: 'Products',
                  href: '/collections',
                });
              }

              // Add product
              breadcrumbItems.push({
                label: product.title,
                href: `/products/${product.handle}`,
              });

              return breadcrumbItems;
            })()}
            className="mb-6"
          />
        </div>

        {/* Hero Section: Image Gallery + Product Info */}
        <div className={layout.container}>
          <div className="grid items-start gap-8 md:gap-12 lg:gap-16 md:grid-cols-2 mb-12 md:mb-16">
            <ProductImageGallery
              images={images.map((img) => ({
                url: img.url,
                altText: img.altText ?? null,
              }))}
              productTitle={product.title}
            />
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

        {/* Product Details Section: Accordions */}
        <div className={`${layout.container} mt-12 md:mt-16`}>
          <ProductAccordions
            productTitle={product.title}
            descriptionHtml={product.descriptionHtml}
            metafields={safeMetafields}
            manualButtons={
              <TechnicalSummaryCard
                productTitle={product.title}
                metafields={safeMetafields}
              />
            }
          />
        </div>

        {/* Product Highlights Section */}
        <div className={`${layout.container} mt-8 md:mt-12`}>
          <ProductHighlights />
        </div>

        {/* Bottom Section */}
        <div className={`${layout.container} mt-8 md:mt-12`}>
          {/* Comparison CTA */}
          <ProductComparisonCTA />
        </div>
      </main>
    </>
  );
}
