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
  // Prevent usage in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 },
    );
  }

  try {
    const response = await shopifyFetch({
      query: QUERY,
      variables: { first: 5 },
    });
    return NextResponse.json(response);
  } catch (err) {
    // Don't expose error details in responses
    console.error('Debug collections error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 },
    );
  }
}
