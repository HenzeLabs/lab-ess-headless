'use server';

import { cookies } from 'next/headers';
import { shopifyFetch } from '@/lib/shopify';
import { getCartQuery } from '@/lib/queries';
import type { Cart } from '@/lib/types';

export async function getCart() {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) {
    return null;
  }
  const cartResponse = await shopifyFetch<{ cart: Cart }>({
    query: getCartQuery,
    variables: { cartId },
  });
  return cartResponse.success && cartResponse.data
    ? cartResponse.data.cart
    : null;
  // ...existing code...

  // TODO: Implement createCart mutation
  return null;
}
