// Debug endpoint to test Shopify collections API connection
import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

const QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first) {
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
