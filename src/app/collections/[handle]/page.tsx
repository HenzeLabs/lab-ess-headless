import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CollectionProducts from '@/components/CollectionProducts';
import type { CollectionData, Product } from '@/lib/types';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';
import { textStyles, layout } from '@/lib/ui';
import CollectionViewTracker from '@/components/analytics/CollectionViewTracker';

export const revalidate = 60;

const formatHandle = (value: string) =>
  value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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
        className="bg-background py-12 lg:py-24"
        role="main"
        aria-label={`Collection: ${collection.title || formatHandle(handle)}`}
      >
        <div className={layout.container}>
          <div className="flex justify-between items-center mb-6">
            <h1 className={`${textStyles.h2} text-foreground`}>
              {collection.title || formatHandle(handle)}
            </h1>
          </div>

          <CollectionProducts
            products={products}
            collectionTitle={collection.title || formatHandle(handle)}
          />
        </div>
      </main>
    </>
  );
}
