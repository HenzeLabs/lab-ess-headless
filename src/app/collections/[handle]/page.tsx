import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import type { CollectionData, Product } from '@/lib/types';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';

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
  const path = page > 1 ? `/collections/${handle}?page=${page}` : `/collections/${handle}`;
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
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(collectionJsonLd)} />
      {productJsonLds.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(json)} />
      ))}
      <main
        id="main-content"
        className="bg-background py-24"
        role="main"
        aria-label={`Collection: ${collection.title || formatHandle(handle)}`}
      >
        <h1 className="mb-16 text-center text-3xl font-semibold tracking-tight text-heading lg:text-4xl">
          {collection.title || formatHandle(handle)}
        </h1>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              {products.length === 0 ? (
                <div
                  className="py-24 text-center text-lg text-body/70"
                  role="status"
                  aria-live="polite"
                >
                  No products found in this collection.
                </div>
              ) : (
                <>
                  <h2 className="mb-8 text-2xl font-bold text-heading" id="products-heading">
                    Products
                  </h2>
                  <div
                    className="grid grid-cols-1 items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    aria-labelledby="products-heading"
                  >
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
