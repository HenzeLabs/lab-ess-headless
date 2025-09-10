// Named export for shopifyFetch, as required by app code
export async function shopifyFetch(
  query: string,
  variables?: Record<string, unknown>,
) {
  try {
    const endpoint = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await result.json();

    if (json.errors) {
      throw new Error(JSON.stringify(json.errors));
    }

    return json.data;
  } catch (err: unknown) {
    console.error("❌ Shopify Fetch Failed:", err);
    throw err;
  }
}
import { createShopifyClient } from "@nextshopkit/sdk";

export const shopify = createShopifyClient({
  shop: process.env.SHOPIFY_STORE_DOMAIN!,
  token: process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
  apiVersion: process.env.SHOPIFY_API_VERSION || "2025-01",
});

export async function storefront<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      // Ensure server-side; never cache during dev:
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storefront error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
