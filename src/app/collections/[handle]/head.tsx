// Dynamic SEO metadata for collection pages
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { shopifyFetch } from "@/lib/shopify";
import { getCollectionByHandleQuery } from "../../../lib/queries";
import type { CollectionData } from "@/lib/types";

// Accept searchParams for pagination/filtering SEO
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams?: Record<string, string | string[]>;
}): Promise<Metadata> {
  const { handle } = params;
  const page =
    Number(
      searchParams?.page ||
        (Array.isArray(searchParams?.page) ? searchParams?.page[0] : 1),
    ) || 1;
  const hasFilters = Object.keys(searchParams || {}).some(
    (key) => key !== "page" && searchParams?.[key],
  );
  let collection: CollectionData | null = null;
  try {
    const apiResponse = await shopifyFetch<{
      collection: CollectionData;
      data?: { collection: CollectionData };
    }>({ query: getCollectionByHandleQuery, variables: { handle, first: 1 } });
    collection = apiResponse.success
      ? (apiResponse.data.collection ?? apiResponse.data.data?.collection)
      : null;
  } catch {}
  if (!collection) {
    return {
      title: "Collection Not Found",
      description: "Sorry, we couldn't find that collection.",
      robots: { index: false, follow: false },
    };
  }
  const siteUrl = getSiteUrl();
  const baseUrl = `${siteUrl}/collections/${collection.handle}`;
  // Pagination rel links
  const alternates = {
    canonical: baseUrl,
    languages: {},
  } as Metadata["alternates"] & { pagination?: Record<string, string> };
  // Pagination rel links using the 'pagination' property if available
  if (page > 1 || (page >= 1 && productsLikelyHaveNextPage(searchParams))) {
    alternates.pagination = {};
    if (page > 1) {
      // previous page
      alternates.pagination.previous = `${baseUrl}?page=${page - 1}`;
    }
    if (productsLikelyHaveNextPage(searchParams)) {
      // next page
      alternates.pagination.next = `${baseUrl}?page=${page + 1}`;
    }
  }
  // Robots noindex for filtered/faceted URLs
  const robots = hasFilters ? { index: false, follow: true } : undefined;
  return {
    title: collection.title,
    description: `Shop the ${collection.title} collection.`,
    openGraph: {
      title: collection.title,
      description: `Shop the ${collection.title} collection.`,
      url: baseUrl,
      type: "website",
      images: collection.image?.url
        ? [
            {
              url: collection.image.url,
              alt: collection.image.altText || collection.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: collection.title,
      description: `Shop the ${collection.title} collection.`,
      images: collection.image?.url ? [collection.image.url] : [],
    },
    alternates,
    ...(robots && { robots }),
  };
}

// Dummy function: in real app, check if there is a next page of products
function productsLikelyHaveNextPage(
  searchParams?: Record<string, string | string[]>,
) {
  // For demo, always return true if page param exists
  return !!searchParams?.page;
}
