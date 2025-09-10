// ...existing code...
import type {
  MenuItem,
  CollectionData,
  ProductWithFilters,
  Product,
} from "@/lib/types";
// import { getSiteUrl } from "@/lib/siteUrl"; // Unused
import { toAppHref } from "@/lib/links";
import { storefront } from "../../../lib/shopify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CollectionFilters from "@/components/CollectionFilters";

import AxeA11yScriptClient from "@/components/AxeA11yScriptClient";

// Import menu data directly to avoid SSR fetch issues
import menuData from "@/data/collections.json";

function getCollections() {
  return (menuData.items || []).map((item: MenuItem) => ({
    id: item.id,
    handle: item.url
      ? toAppHref(item.url).replace("/collections/", "")
      : item.title.toLowerCase(),
    title: item.title,
    url: item.url,
    items: item.items,
    image: item.image,
  }));
}

// You need to define or import getCollectionByHandleQuery for the storefront call below
import { getCollectionByHandleQuery } from "../../../lib/queries";

// import { useSearchParams } from "next/navigation"; // Unused

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams?: { [key: string]: string | string[] };
}) {
  const { handle } = params;
  // Fetch menu/collections for Header
  const collections = getCollections();
  // Fetch collection by handle
  let collection: CollectionData | null = null;
  let products: ProductWithFilters[] = [];
  let fetchError: unknown = null;
  try {
    const apiResponse = await storefront<{
      collection: CollectionData;
      data?: { collection: CollectionData };
    }>(getCollectionByHandleQuery, {
      handle,
      first: 20,
    });
    collection =
      apiResponse?.collection ?? apiResponse?.data?.collection ?? null;
    if (collection && collection.products && collection.products.edges) {
      products = collection.products.edges.map((edge) => {
        const node = edge.node;
        return {
          ...node,
          featuredImage:
            node.featuredImage === null ? undefined : node.featuredImage,
          tags: Array.isArray((node as ProductWithFilters).tags)
            ? (node as ProductWithFilters).tags
            : [],
          priceRange:
            typeof (node as ProductWithFilters).priceRange === "object" &&
            (node as ProductWithFilters).priceRange !== null
              ? (node as ProductWithFilters).priceRange
              : { minVariantPrice: { amount: "", currencyCode: "" } },
        };
      });
    }
  } catch (err: unknown) {
    fetchError = err;
    console.error("[CollectionPage] Error fetching collection", err);
  }

  // Error state: fetch failed
  if (fetchError) {
    return (
      <>
        <Header collections={collections} />
        <main className="bg-koala-light-grey py-24">
          <div className="max-w-2xl mx-auto text-center py-24">
            <h1 className="text-3xl font-bold mb-4">
              Error loading collection
            </h1>
            <p className="text-koala-dark-grey mb-8">
              Sorry, there was a problem loading this collection. Please try
              again later.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Not found state: collection is null
  if (!collection) {
    return (
      <>
        <Header collections={collections} />
        <main className="bg-koala-light-grey py-24">
          <div className="max-w-2xl mx-auto text-center py-24">
            <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
            <p className="text-koala-dark-grey mb-8">
              Sorry, we couldn&apos;t find that collection.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Pagination SEO logic
  const page =
    Number(
      searchParams?.page ||
        (Array.isArray(searchParams?.page) ? searchParams?.page[0] : 1),
    ) || 1;
  const hasFilters = Object.keys(searchParams || {}).some(
    (key) => key !== "page" && searchParams?.[key],
  );
  const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${handle}`;
  const prevUrl = page > 2 ? `${baseUrl}?page=${page - 1}` : baseUrl;
  const nextUrl = `${baseUrl}?page=${page + 1}`;
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: collection.title, url: `/collections/${collection.handle}` },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${crumb.url}`,
    })),
  };

  // Collection JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collection.handle}`,
    ...(collection.image?.url && {
      image: {
        "@type": "ImageObject",
        url: collection.image.url,
        ...(collection.image.altText && { alt: collection.image.altText }),
      },
    }),
  };

  // Product JSON-LD for each product (only fields that exist on ProductNode)
  const productJsonLds = products.map((product) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
    ...(product.featuredImage?.url && {
      image: product.featuredImage.url,
    }),
  }));

  return (
    <>
      {/* Pagination rel prev/next/canonical links for SEO */}
      <head>
        {page > 1 && <link rel="prev" href={prevUrl} />}
        {/* For demo, always show next if page param exists; in real app, check if next page exists */}
        {page >= 1 && <link rel="next" href={nextUrl} />}
        <link rel="canonical" href={baseUrl} />
        {hasFilters && <meta name="robots" content="noindex,follow" />}
      </head>
      {/* BreadcrumbList JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Collection JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* Product JSON-LD for each product */}
      {productJsonLds.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
      ))}
      {process.env.NODE_ENV === "development" && <AxeA11yScriptClient />}
      <Header collections={collections} />
      <main className="bg-koala-light-grey py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl font-extrabold tracking-tight text-koala-dark-grey sm:text-5xl text-center mb-16"
            tabIndex={-1}
            aria-label={`Collection: ${collection.title}`}
          >
            {collection.title}
          </h1>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <CollectionFilters products={products} />
            </aside>
            {/* Products */}
            <div className="flex-1">
              {products.length === 0 ? (
                <div
                  className="text-center py-24 text-koala-dark-grey text-lg"
                  role="status"
                  aria-live="polite"
                >
                  No products found in this collection.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in items-stretch">
                    {products.map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {/* Load More */}
                  <div className="mt-12 text-center">
                    <button
                      className="bg-koala-green hover:bg-koala-green-dark text-white px-8 py-3 rounded-full font-medium transition-colors"
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
