'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { cartLinesRemoveMutation } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';

export async function removeCartLineAction(formData: FormData) {
  const lineId = formData.get('lineId');
  if (typeof lineId !== 'string' || lineId.length === 0) {
    return;
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  if (!cartId) {
    console.warn('Attempted to remove cart line without a cartId cookie');
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
      console.error('Shopify cartLinesRemove userErrors:', userErrors);
      throw new Error(userErrors.map((e) => e.message).join('\n'));
    }

    revalidatePath('/cart');
  } catch (error) {
    console.error('Failed to remove cart line', error);
    throw error;
  }
}
