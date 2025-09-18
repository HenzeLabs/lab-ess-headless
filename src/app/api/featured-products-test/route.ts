// Temporary test API route for Shopify products query
import { NextResponse } from 'next/server';

export async function GET() {
  const PRODUCTS_QUERY = `
    {
      products(first: 3) {
        edges {
          node {
            title
            handle
            variants(first: 1) {
              edges {
                node {
                  price {
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

  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token':
          process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY }),
    },
  );

  const json = await res.json();
  // eslint-disable-next-line no-console
  
  return NextResponse.json(json);
}
