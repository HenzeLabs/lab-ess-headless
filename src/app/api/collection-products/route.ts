import { NextResponse } from 'next/server';

import { shopifyFetch } from '@/lib/shopify';
import { getCollectionProductsByHandleQuery } from '@/lib/queries';
import type { Product } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');
  const firstParam = searchParams.get('first');
  const parsedFirst = Number(firstParam);
  const first = Number.isInteger(parsedFirst) && parsedFirst > 0 ? Math.min(parsedFirst, 20) : 12;

  if (!handle) {
    return NextResponse.json(
      { error: 'Missing collection handle.' },
      { status: 400 },
    );
  }

  try {
    const { data } = await shopifyFetch<{
      collection: {
        products: { edges: { node: Product }[] } | null;
      } | null;
    }>({
      query: getCollectionProductsByHandleQuery,
      variables: { handle, first },
    });

    const products =
      data.collection?.products?.edges?.map((edge) => edge.node) ?? [];

    return NextResponse.json({ products });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Unable to load collection products.' },
      { status: 500 },
    );
  }
}
