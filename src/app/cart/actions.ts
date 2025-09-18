'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  cartCreateMutation,
  cartLinesAddMutation,
  cartLinesRemoveMutation,
  cartLinesUpdateMutation,
} from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { Cart } from '@/lib/types';

export async function addCartLineAction(
  variantId: string,
  quantity: number = 1,
) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  let cart: Cart | null = null;

  const merchandiseId = variantId.startsWith('gid://shopify/ProductVariant/') ? variantId : `gid://shopify/ProductVariant/${variantId}`;

  // If no cart, create one
  if (!cartId) {
    const createRes = await shopifyFetch<{
      cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
    }>({
      query: cartCreateMutation,
      variables: { input: { lines: [{ merchandiseId, quantity }] } },
    });
    cart = createRes.data.cartCreate.cart;
    if (cart?.id) {
      cookieStore.set('cartId', cart.id, { path: '/', httpOnly: false });
      revalidatePath('/');
    } else {
      console.error('Failed to create cart or cart ID is missing.');
    }
  } else {
    // Add line to existing cart
    const addRes = await shopifyFetch<{
      cartLinesAdd: { cart: Cart | null; userErrors: { message: string }[] };
    }>({
      query: cartLinesAddMutation,
      variables: { cartId, lines: [{ merchandiseId, quantity }] },
    });
    cart = addRes.data.cartLinesAdd.cart;
    if (!cart) {
      console.error('Failed to add line to cart or cart object is missing.');
    }
    revalidatePath('/');
  }

  return cart;
}

export async function removeCartLineAction(formData: FormData) {
  const lineId = formData.get('lineId');
  if (typeof lineId !== 'string' || lineId.length === 0) {
    return;
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  if (!cartId) {
    return;
  }

  try {
    const response = await shopifyFetch<{
      cartLinesRemove: {
        cart: { id: string } | null;
        userErrors: { field?: string[] | null; message: string }[];
      };
    }>({
      query: cartLinesRemoveMutation,
      variables: {
        cartId,
        lineIds: [lineId],
      },
    });

    const userErrors = response.data.cartLinesRemove.userErrors;
    if (userErrors && userErrors.length > 0) {
      throw new Error(userErrors.map((e) => e.message).join('\n'));
    }

    revalidatePath('/cart');
  } catch (error) {
    throw error;
  }
}

export async function deleteCartCookieAction() {
  const cookieStore = await cookies();
  cookieStore.delete('cartId');
  revalidatePath('/'); // Revalidate to update UI that depends on cartId
}

export async function updateCartLineAction(formData: FormData) {
  const lineId = formData.get('lineId');
  const quantity = formData.get('quantity');

  if (typeof lineId !== 'string' || lineId.length === 0) {
    return;
  }
  if (typeof quantity !== 'string' || quantity.length === 0) {
    return;
  }

  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity < 0) {
    return;
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  if (!cartId) {
    return;
  }

  try {
    const response = await shopifyFetch<{
      cartLinesUpdate: {
        cart: { id: string } | null;
        userErrors: { field?: string[] | null; message: string }[];
      };
    }>({
      query: cartLinesUpdateMutation,
      variables: {
        cartId,
        lines: [{
          id: lineId,
          quantity: parsedQuantity,
        }],
      },
    });

    const userErrors = response.data.cartLinesUpdate.userErrors;
    if (userErrors && userErrors.length > 0) {
      throw new Error(userErrors.map((e) => e.message).join('\n'));
    }

    revalidatePath('/cart');
  } catch (error) {
    throw error;
  }
}
