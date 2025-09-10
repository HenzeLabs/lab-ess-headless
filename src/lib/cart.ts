'use server';

import { cookies } from 'next/headers';
import { shopifyFetch } from '@/lib/shopify';
import { createCartMutation, getCartQuery } from '@/lib/queries';
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
  return cartResponse.success ? cartResponse.data.cart : null;
}

export async function createCart() {
  const cartResponse = await shopifyFetch<{ cartCreate: { cart: Cart } }>({
    query: createCartMutation,
  });
  if (cartResponse.success) {
    (await cookies()).set('cartId', cartResponse.data.cartCreate.cart.id);
    return cartResponse.data.cartCreate.cart;
  }
  return null;
}
