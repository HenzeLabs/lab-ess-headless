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
  try {
    const cartResponse = await shopifyFetch<{ cart: Cart | null }>({
      query: getCartQuery,
      variables: { cartId },
    });
    return cartResponse.data.cart ?? null;
  } catch (error) {
    
    return null;
  }
}
