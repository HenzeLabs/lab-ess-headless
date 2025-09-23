import { shopifyFetch } from '@/lib/shopify';
import { withCache, CacheKeys, CacheTTL } from '@/lib/cache/manager';
import type { CollectionData, Product, MenuItem } from '@/lib/types';

// Cached Shopify API functions

export async function getCachedProduct(
  handle: string,
): Promise<Product | null> {
  return withCache(
    CacheKeys.product(handle),
    async () => {
      try {
        const query = `
          query getProduct($handle: String!) {
            product(handle: $handle) {
              id
              title
              handle
              descriptionHtml
              tags
              featuredImage {
                url
                altText
              }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    availableForSale
                    quantityAvailable
                  }
                }
              }
              seo {
                title
                description
              }
            }
          }
        `;

        const result = await shopifyFetch<{ product: Product }>({
          query,
          variables: { handle },
        });

        return result.data?.product || null;
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },
    CacheTTL.LONG,
  );
}

export async function getCachedCollection(
  handle: string,
): Promise<CollectionData | null> {
  return withCache(
    CacheKeys.collection(handle),
    async () => {
      try {
        const query = `
          query getCollection($handle: String!) {
            collection(handle: $handle) {
              id
              title
              handle
              description
              image {
                url
                altText
              }
              products(first: 20) {
                edges {
                  node {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          price {
                            amount
                            currencyCode
                          }
                          compareAtPrice {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const result = await shopifyFetch<{ collection: CollectionData }>({
          query,
          variables: { handle },
        });

        return result.data?.collection || null;
      } catch (error) {
        console.error('Error fetching collection:', error);
        return null;
      }
    },
    CacheTTL.MEDIUM,
  );
}

export async function getCachedCollections(): Promise<CollectionData[]> {
  return withCache(
    CacheKeys.collections(),
    async () => {
      try {
        const query = `
          query getCollections {
            collections(first: 50) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        `;

        const result = await shopifyFetch<{
          collections: { edges: { node: CollectionData }[] };
        }>({
          query,
        });

        return result.data?.collections?.edges.map((edge) => edge.node) || [];
      } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
      }
    },
    CacheTTL.LONG,
  );
}

export async function getCachedMenu(handle: string): Promise<MenuItem[]> {
  return withCache(
    CacheKeys.menu(handle),
    async () => {
      try {
        const query = `
          query getMenu($handle: String!) {
            menu(handle: $handle) {
              items {
                id
                title
                url
                items {
                  id
                  title
                  url
                  items {
                    id
                    title
                    url
                  }
                }
              }
            }
          }
        `;

        const result = await shopifyFetch<{ menu: { items: MenuItem[] } }>({
          query,
          variables: { handle },
        });

        return result.data?.menu?.items || [];
      } catch (error) {
        console.error('Error fetching menu:', error);
        return [];
      }
    },
    CacheTTL.DAY,
  );
}

export async function getCachedProducts(
  collection?: string,
  page = 1,
  pageSize = 20,
): Promise<Product[]> {
  return withCache(
    CacheKeys.products(collection, page),
    async () => {
      try {
        const query = collection
          ? `
            query getCollectionProducts($handle: String!, $first: Int!, $after: String) {
              collection(handle: $handle) {
                products(first: $first, after: $after) {
                  edges {
                    node {
                      id
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                      variants(first: 1) {
                        edges {
                          node {
                            price {
                              amount
                              currencyCode
                            }
                            compareAtPrice {
                              amount
                              currencyCode
                            }
                          }
                        }
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          `
          : `
            query getProducts($first: Int!, $after: String) {
              products(first: $first, after: $after) {
                edges {
                  node {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          price {
                            amount
                            currencyCode
                          }
                          compareAtPrice {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          `;

        const variables = {
          first: pageSize,
          after:
            page > 1
              ? btoa(`arrayconnection:${(page - 1) * pageSize - 1}`)
              : undefined,
          ...(collection && { handle: collection }),
        };

        const result = await shopifyFetch<{
          products?: { edges: { node: Product }[] };
          collection?: { products: { edges: { node: Product }[] } };
        }>({ query, variables });

        const products = collection
          ? result.data?.collection?.products?.edges.map((edge) => edge.node) ||
            []
          : result.data?.products?.edges.map((edge) => edge.node) || [];

        return products;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    CacheTTL.MEDIUM,
  );
}

export async function searchCachedProducts(
  query: string,
  page = 1,
  pageSize = 20,
): Promise<Product[]> {
  return withCache(
    CacheKeys.search(query, page),
    async () => {
      try {
        const searchQuery = `
          query searchProducts($query: String!, $first: Int!, $after: String) {
            products(query: $query, first: $first, after: $after) {
              edges {
                node {
                  id
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const variables = {
          query,
          first: pageSize,
          after:
            page > 1
              ? btoa(`arrayconnection:${(page - 1) * pageSize - 1}`)
              : undefined,
        };

        const result = await shopifyFetch<{
          products: { edges: { node: Product }[] };
        }>({
          query: searchQuery,
          variables,
        });

        return result.data?.products?.edges.map((edge) => edge.node) || [];
      } catch (error) {
        console.error('Error searching products:', error);
        return [];
      }
    },
    CacheTTL.SHORT,
  );
}

// Cache invalidation helpers
export async function invalidateProductCache(handle: string): Promise<void> {
  const cache = (await import('@/lib/cache/manager')).getCacheManager();
  await cache.del(CacheKeys.product(handle));
  await cache.invalidatePattern(`shopify:products:*`);
}

export async function invalidateCollectionCache(handle: string): Promise<void> {
  const cache = (await import('@/lib/cache/manager')).getCacheManager();
  await cache.del(CacheKeys.collection(handle));
  await cache.del(CacheKeys.collections());
  await cache.invalidatePattern(`shopify:products:${handle}:*`);
}

export async function invalidateAllShopifyCache(): Promise<void> {
  const cache = (await import('@/lib/cache/manager')).getCacheManager();
  await cache.invalidatePattern('shopify:*');
}
