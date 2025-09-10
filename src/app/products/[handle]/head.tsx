import { storefront } from "../../../lib/shopify";
import { getSiteUrl } from "@/lib/siteUrl";
import { getCollectionByHandleQuery } from "../../../lib/queries";
import type { Metadata } from "next";
import type { ProductNode } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const { handle } = params;
  let product: ProductNode | null = null;
  try {
    // You may need to adjust this query to fetch a single product by handle
    const apiResponse = await storefront<{
      product: ProductNode;
      data?: { product: ProductNode };
    }>(
      getCollectionByHandleQuery, // Replace with getProductByHandleQuery if available
      { handle, first: 1 },
    );
    product = apiResponse?.product ?? apiResponse?.data?.product ?? null;
  } catch {}
  if (!product) {
    return {
      title: "Product Not Found",
      description: "Sorry, we couldn't find that product.",
      robots: { index: false, follow: false },
    };
  }
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/products/${product.handle}`;
  return {
    title: product.title,
    description: product.title,
    openGraph: {
      title: product.title,
      description: product.title,
      url,
      type: "website",
      images: product.featuredImage?.url
        ? [{ url: product.featuredImage.url, alt: product.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.title,
      images: product.featuredImage?.url ? [product.featuredImage.url] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}
