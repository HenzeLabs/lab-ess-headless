import { ShopifyFetchResponse } from '@/lib/types';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_API_TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

async function fetchWithRetry(
  endpoint: string,
  options: RequestInit,
  retries = 3,
  delay = 1000,
): Promise<Response> {
  try {
    const res = await fetch(endpoint, options);

    if (res.status === 429 || res.status >= 500) {
      if (retries > 0) {
        console.warn(
          `Shopify API returned ${res.status}. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(endpoint, options, retries - 1, delay * 2);
      } else {
        throw new Error(
          `Shopify API returned ${res.status} after multiple retries.`,
        );
      }
    }

    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed. Retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(endpoint, options, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
}

/**
 * Typed Shopify Storefront API client for server use only.
 *
 * Usage:
 *   const result = await shopifyFetch<MyType>({ query, variables });
 *   // result.data: MyType
 */
export async function shopifyFetch<T>({
  query,
  variables,
  timeout = 15000,
}: {
  query: string;
  variables?: Record<string, unknown>;
  timeout?: number;
}): Promise<ShopifyFetchResponse<T>> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_API_TOKEN) {
    throw new Error(
      'Missing Shopify environment variables. Make sure SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_API_TOKEN are set.',
    );
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(timeout),
  };

  try {
    const res = await fetchWithRetry(endpoint, options);
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify API error: ${res.status} ${text}`);
    }
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Non-JSON response from Shopify: ${text}`);
    }

    const json = await res.json();
    const { data, errors } = json as {
      data?: T;
      errors?: { message: string }[];
    };

    if (errors && errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join('\n'));
    }
    if (!data) {
      throw new Error('No data returned from Shopify.');
    }

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    console.error('❌ Shopify Fetch Failed:', err);
    throw err instanceof Error
      ? err
      : new Error('An unknown error occurred while contacting Shopify.');
  }
}

export const getMainMenuQuery = /* GraphQL */ `
  query GetMainMenu {
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        resourceId
        items {
          id
          title
          url
          resourceId
          items {
            id
            title
            url
            resourceId
          }
        }
      }
    }
  }
`;

export const getCollectionsByIdQuery = /* GraphQL */ `
  query getCollectionsById($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Collection {
        id
        title
        image {
          url
          altText
        }
        products(first: 1) {
          edges {
            node {
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductsByIdQuery = /* GraphQL */ `
  query getProductsById($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        featuredImage {
          url
          altText
        }
      }
    }
  }
`;

export async function fetchShopBrand<T>() {
  const query = /* GraphQL */ `
    query GetShopBrand {
      shop {
        name
        brand {
          logo {
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;
  return shopifyFetch<T>({ query });
}
