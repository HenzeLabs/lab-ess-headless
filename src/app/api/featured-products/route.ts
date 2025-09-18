import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { getCollectionByHandleQuery } from '@/lib/queries';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const response = await shopifyFetch<{
      collection: {
        products: { edges: { node: unknown }[] };
      } | null;
    }>({
      query: getCollectionByHandleQuery,
      variables: {
        handle: 'featured-products',
        first: 8,
      },
    });
    const collection = response.data.collection;

    if (!collection) {
      console.warn('No collection data returned from Shopify');
      return NextResponse.json({ products: [], success: false });
    }

    const products = collection.products?.edges?.map((edge) => edge.node) ?? [];

    return NextResponse.json({
      success: true,
      collection,
      products,
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: String(error), products: [], debug: error },
      { status: 500 },
    );
  }
}
