import { MetadataRoute } from 'next';
import { shopifyFetch } from '@/lib/shopify';
import { getAllProductsQuery, getCollectionsListQuery } from '@/lib/queries';

type CollectionSitemapData = {
  collections: {
    edges: {
      node: {
        handle: string;
        updatedAt: string;
      };
    }[];
  };
};

type ProductSitemapData = {
  products: {
    edges: {
      node: {
        handle: string;
        updatedAt: string;
      };
    }[];
  };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not set');
  }

  const { data: collectionsData } = await shopifyFetch<CollectionSitemapData>({
    query: getCollectionsListQuery,
  });

  const { data: productsData } = await shopifyFetch<ProductSitemapData>({
    query: getAllProductsQuery,
  });

  const collectionUrls = collectionsData.collections.edges.map((edge) => {
    return {
      url: `${siteUrl}/collections/${edge.node.handle}`,
      lastModified: edge.node.updatedAt,
    };
  });

  const productUrls = productsData.products.edges.map((edge) => {
    return {
      url: `${siteUrl}/products/${edge.node.handle}`,
      lastModified: edge.node.updatedAt,
    };
  });

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    ...collectionUrls,
    ...productUrls,
  ];
}