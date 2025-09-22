
import { shopifyFetch } from '@/lib/shopify';
import { NextResponse } from 'next/server';
import { ShopifyCollections } from '@/lib/types';

const GET_ALL_COLLECTIONS_QUERY = /* GraphQL */ `
  query GetAllCollections {
    collections(first: 250) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

export async function GET() {
  console.log('Starting collection diagnosis...');

  try {
    const { data } = await shopifyFetch<ShopifyCollections>({ query: GET_ALL_COLLECTIONS_QUERY });
    const collections = data.collections.edges.map(edge => edge.node);

    if (!collections.length) {
      return NextResponse.json({ error: 'No collections found in Shopify.' }, { status: 404 });
    }

    return NextResponse.json({ collections });

  } catch (error) {
    console.error('Error fetching collections from Shopify:', error);
    return NextResponse.json({ error: 'Error fetching collections from Shopify.' }, { status: 500 });
  }
}
