// Debug endpoint to test Shopify products API connection
import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

const QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const response = await shopifyFetch({
      query: QUERY,
      variables: { first: 5 },
    });
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
