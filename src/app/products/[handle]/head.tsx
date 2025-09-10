import { shopifyFetch } from "../../../lib/shopify";
import { getSiteUrl } from "@/lib/siteUrl";
import { getProductByHandleQuery } from "../../../lib/queries";
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
    const apiResponse = await shopifyFetch<{
      product: ProductNode;
    }>({
      query: getProductByHandleQuery,
      variables: { handle, first: 1 },
    });

    if (apiResponse.success) {
      product = apiResponse.data.product ?? null;
    } else {
      console.error("Failed to fetch product:", apiResponse.errors);
      product = null;
    }
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
