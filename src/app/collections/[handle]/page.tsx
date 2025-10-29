import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import CollectionProducts from '@/components/CollectionProducts';
import StickyCollectionCTAWrapper from '@/components/StickyCollectionCTAWrapper';
import type { CollectionData, Product } from '@/lib/types';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';
import CollectionViewTracker from '@/components/analytics/CollectionViewTracker';
import { layout } from '@/lib/ui';

export const revalidate = 60;

const formatHandle = (value: string) =>
  value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

function CollectionDescription({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  // Strip HTML and remove JSON-LD schema markup
  let cleanDescription = stripHtml(description);

  // Remove JSON-LD schema by finding the first occurrence of JSON pattern and removing everything after it
  // Look for patterns like { "@context": or { "@type":
  const jsonStartPattern = /\{[\s\S]*?"@(?:context|type)":/;
  const jsonStartMatch = cleanDescription.match(jsonStartPattern);

  if (jsonStartMatch && jsonStartMatch.index !== undefined) {
    // If we find JSON, take everything before it
    cleanDescription = cleanDescription
      .substring(0, jsonStartMatch.index)
      .trim();
  }

  // Clean up any remaining artifacts (stray braces, commas, brackets)
  cleanDescription = cleanDescription
    .replace(/[{}\[\]]/g, '')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanDescription) return null;

  return (
    <div className="mt-12 md:mt-16 border-t border-border/50 pt-8 md:pt-12">
      <div className="prose prose-sm max-w-none">
        <h2 className="text-xl font-semibold text-[hsl(var(--ink))] mb-4">
          About {title}
        </h2>
        <div className="text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
          {cleanDescription}
        </div>
      </div>
    </div>
  );
}

async function getCollection(handle: string): Promise<CollectionData | null> {
  if (!handle || !/^[a-zA-Z0-9-_]+$/.test(handle)) {
    return null;
  }

  try {
    const response = await shopifyFetch<{
      collection: CollectionData | null;
    }>({
      query: getCollectionByHandleQuery,
      variables: { handle, first: 16 },
    });
    return response.data.collection ?? null;
  } catch (error) {
    console.error(`Failed to load collection ${handle}`, error);
    return null;
  }
}

export async function generateMetadata({
  params: paramsPromise,
  searchParams: searchParamsPromise = Promise.resolve({}),
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}): Promise<Metadata> {
  const { handle } = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const collection = await getCollection(handle);

  if (!collection) {
    return {
      title: 'Collection Not Found | Lab Essentials',
      robots: { index: false, follow: true },
    };
  }

  const pageParam = Array.isArray(searchParams?.page)
    ? searchParams.page[0]
    : searchParams?.page;
  const page = pageParam ? Number(pageParam) || 1 : 1;
  const path =
    page > 1 ? `/collections/${handle}?page=${page}` : `/collections/${handle}`;
  const canonical = absoluteUrl(path);

  const hasFilters = Object.entries(searchParams || {}).some(
    ([key, value]) =>
      key !== 'page' &&
      value !== undefined &&
      value !== null &&
      (Array.isArray(value) ? value.length > 0 : value !== ''),
  );

  const title = `${collection.title || formatHandle(handle)} | Lab Essentials`;
  const description = collection.description
    ? stripHtml(collection.description).slice(0, 160)
    : 'Shop lab-ready equipment, instruments, and consumables curated by Lab Essentials.';

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: hasFilters ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CollectionPage({
  params: paramsPromise,
  searchParams: searchParamsPromise = Promise.resolve({}),
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { handle } = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const collection = await getCollection(handle);

  if (!collection) {
    notFound();
  }

  const products: Product[] =
    collection.products?.edges?.map((edge) => edge.node) ?? [];
  const analyticsProducts = products.map((product) => ({
    id: product.id,
    name: product.title,
    price: product.priceRange?.minVariantPrice?.amount ?? null,
    currency: product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
    category: collection.title || formatHandle(handle),
  }));

  const pageParam = Array.isArray(searchParams?.page)
    ? searchParams.page[0]
    : searchParams?.page;
  const page = pageParam ? Number(pageParam) || 1 : 1;
  const basePath = `/collections/${handle}`;
  const canonicalPath = page > 1 ? `${basePath}?page=${page}` : basePath;
  const canonical = absoluteUrl(canonicalPath);

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
        name: collection.title || formatHandle(handle),
        item: canonical,
      },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title || formatHandle(handle),
    description: stripHtml(collection.description) || undefined,
    url: canonical,
  };

  const productJsonLds = products.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    url: absoluteUrl(`/products/${product.handle}`),
    image: product.featuredImage?.url,
    offers: product.priceRange?.minVariantPrice?.amount
      ? {
          '@type': 'Offer',
          priceCurrency:
            product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
          price: product.priceRange?.minVariantPrice?.amount,
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(collectionJsonLd)}
      />
      {productJsonLds.map((json, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(json)}
        />
      ))}
      <CollectionViewTracker
        collectionName={collection.title || formatHandle(handle)}
        products={analyticsProducts}
        currency={analyticsProducts[0]?.currency}
      />
      <main
        id="main-content"
        className="bg-background min-h-screen"
        role="main"
        aria-label={`Collection: ${collection.title || formatHandle(handle)}`}
      >
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/5 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-12 md:py-16">
          {/* Animated background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Glowing orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--brand))]/10 rounded-full blur-3xl" />

          <div className={`${layout.container} relative z-10`}>
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand))] transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
                <li className="text-[hsl(var(--muted-foreground))]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
                <li>
                  <Link
                    href="/collections"
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand))] transition-colors font-medium"
                  >
                    Collections
                  </Link>
                </li>
                <li className="text-[hsl(var(--muted-foreground))]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
                <li>
                  <span className="font-semibold text-[hsl(var(--ink))]">
                    {collection.title || formatHandle(handle)}
                  </span>
                </li>
              </ol>
            </nav>

            {/* Collection Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-5 py-2 border border-[hsl(var(--brand))]/20">
                <svg
                  className="w-5 h-5 text-[hsl(var(--brand))]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                  Collection
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--ink))] tracking-tight">
                {collection.title || formatHandle(handle)}
              </h1>
              <p className="text-lg text-[hsl(var(--body))] max-w-3xl">
                {products.length}{' '}
                {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className={`${layout.container} py-12 md:py-16`}>
          <CollectionProducts
            products={products}
            collectionTitle={collection.title || formatHandle(handle)}
          />

          {/* Collection Description - Below Grid */}
          {collection.description && (
            <CollectionDescription
              description={collection.description}
              title={collection.title || formatHandle(handle)}
            />
          )}
        </div>
      </main>

      {/* Sticky Collection CTA Bar */}
      <StickyCollectionCTAWrapper
        collectionTitle={collection.title || formatHandle(handle)}
        productCount={products.length}
      />
    </>
  );
}
