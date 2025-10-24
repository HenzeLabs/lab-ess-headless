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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://labessentials.com';

  // Warn if using fallback URL
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn('NEXT_PUBLIC_SITE_URL not set, using fallback URL:', siteUrl);
  }

  // Check if Shopify credentials are available (required for fetching dynamic data)
  const hasShopifyCredentials =
    process.env.SHOPIFY_STORE_DOMAIN &&
    (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_STOREFRONT_API_TOKEN);

  // If no Shopify credentials, return minimal sitemap (for CI/preview builds)
  if (!hasShopifyCredentials) {
    console.warn('Shopify credentials not available, generating minimal sitemap');
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
      },
    ];
  }

  // Fetch collections and products from Shopify
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