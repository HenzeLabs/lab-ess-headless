
import { shopifyFetch } from '@/lib/shopify';
import { NextResponse } from 'next/server';
import { ShopifyCollection } from '@/lib/types';

const GET_ONE_COLLECTION_QUERY = /* GraphQL */ `
  query GetOneCollection {
    collections(first: 1) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export async function GET() {
  console.log('Starting health check...');

  try {
    // 1. Verify Shopify API connectivity
    const { data } = await shopifyFetch<ShopifyCollection>({ query: GET_ONE_COLLECTION_QUERY });
    const collection = data.collections.edges[0]?.node;

    if (!collection) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'No collections found in Shopify.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // 2. Check that the collection page for that collection can be rendered
    const collectionPageUrl = `http://localhost:3000/collections/${collection.handle}`;
    const collectionPageResponse = await fetch(collectionPageUrl);

    if (!collectionPageResponse.ok) {
      return NextResponse.json({
        status: 'degraded',
        error: `Collection page for ${collection.handle} failed to load`,
        collectionPageStatus: collectionPageResponse.status,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'healthy',
      services: {
        shopify: 'connected',
        collectionPages: 'operational'
      },
      testedCollection: collection.handle,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
