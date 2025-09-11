import { notFound } from 'next/navigation';

import type { Product } from '@/lib/types';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60;

export default async function CollectionPage({
  params: paramsPromise,
  searchParams: searchParamsPromise = Promise.resolve({}),
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] }>;
}) {
  // Next.js 15: params and searchParams are Promises
  const { handle } = await paramsPromise;
  const searchParams = await searchParamsPromise;
  if (typeof handle !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(handle))
    notFound();

  // Placeholder fallback for now
  const collection = { title: 'Collection', handle };
  const products: Product[] = [];

  const page =
    Number(
      searchParams?.page ||
        (Array.isArray(searchParams?.page) ? searchParams?.page[0] : 1),
    ) || 1;
  const hasFilters = Object.keys(searchParams || {}).some(
    (key) => key !== 'page' && searchParams?.[key],
  );
  const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${handle}`;
  const prevUrl = page > 2 ? `${baseUrl}?page=${page - 1}` : baseUrl;
  const nextUrl = `${baseUrl}?page=${page + 1}`;
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: collection.title, url: `/collections/${collection.handle}` },
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

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collection.handle}`,
  };

  const productJsonLds = products.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
    ...(product.featuredImage?.url && {
      image: product.featuredImage.url,
    }),
  }));

  return (
    <>
      <head>
        {page > 1 && <link rel="prev" href={prevUrl} />}
        {products.length > 0 && <link rel="next" href={nextUrl} />}
        <link rel="canonical" href={baseUrl} />
        {hasFilters && <meta name="robots" content="noindex,follow" />}
      </head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {productJsonLds.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
      ))}
      {/* AxeA11yScriptClient removed */}
      <main id="main-content" className="bg-background py-24" role="main">
        <h1
          className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground text-center mb-16"
          tabIndex={-1}
          aria-label={`Collection: ${collection.title}`}
        >
          {collection.title}
        </h1>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* CollectionFilters removed */}
            <div className="flex-1">
              {products.length === 0 ? (
                <div
                  className="text-center py-24 text-muted-foreground text-lg"
                  role="status"
                  aria-live="polite"
                >
                  No products found in this collection.
                </div>
              ) : (
                <>
                  <h2
                    className="text-2xl font-bold text-foreground mb-8"
                    id="products-heading"
                  >
                    Products
                  </h2>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in items-stretch"
                    aria-labelledby="products-heading"
                  >
                    {products.map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="mt-12 text-center">
                    <button
                      className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-full font-medium transition-colors"
                      aria-label="Load more products"
                      tabIndex={0}
                      type="button"
                    >
                      Load More Products
                    </button>
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
