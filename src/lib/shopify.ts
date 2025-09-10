import { ShopifyFetchResponse } from "@/lib/types";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_API_TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

async function fetchWithRetry(
  endpoint: string,
  options: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  try {
    const res = await fetch(endpoint, options);

    if (res.status === 429 || res.status >= 500) {
      if (retries > 0) {
        console.warn(
          `Shopify API returned ${res.status}. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(endpoint, options, retries - 1, delay * 2);
      } else {
        throw new Error(
          `Shopify API returned ${res.status} after multiple retries.`
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
 *   if (!result.success) { throw new Error(result.errors); }
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
      "Missing Shopify environment variables. Make sure SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_API_TOKEN are set."
    );
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_API_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(timeout),
  };

  try {
    const res = await fetchWithRetry(endpoint, options);
    const { data, errors } = await res.json();

    if (errors) {
      return {
        success: false,
        errors: errors.map((e: { message: string }) => e.message).join("\n"),
      };
    }

    if (!data) {
      return {
        success: false,
        errors: "No data returned from Shopify.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    console.error("❌ Shopify Fetch Failed:", err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred.";
    return {
      success: false,
      errors: message,
    };
  }
}
