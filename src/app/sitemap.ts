import { MetadataRoute } from "next";
import { shopifyFetch } from "@/lib/shopify";
import { getCollectionsQuery, getProductsQuery } from "@/lib/queries";
import type { CollectionData, Product } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  const collectionsResponse = await shopifyFetch<{
    collections: { edges: { node: CollectionData }[] };
  }>({ query: getCollectionsQuery });
  const collections = collectionsResponse.success
    ? collectionsResponse.data.collections.edges.map((edge) => edge.node)
    : [];

  const productsResponse = await shopifyFetch<{
    products: { edges: { node: Product }[] };
  }>({ query: getProductsQuery });
  const products = productsResponse.success
    ? productsResponse.data.products.edges.map((edge) => edge.node)
    : [];

  const collectionUrls = collections.map((collection) => ({
    url: `${siteUrl}/collections/${collection.handle}`,
    lastModified: new Date(),
  }));

  const productUrls = products.map((product) => ({
    url: `${siteUrl}/products/${product.handle}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    ...collectionUrls,
    ...productUrls,
  ];
}
