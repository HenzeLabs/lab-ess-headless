import { createShopifyClient } from "@nextshopkit/sdk";

export const shopify = createShopifyClient({
  shop: process.env.SHOPIFY_STORE_DOMAIN!,
  token: process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
  apiVersion: process.env.SHOPIFY_API_VERSION || "2025-01",
});

export async function storefront<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    // Ensure server-side; never cache during dev:
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storefront error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

