import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { shopifyFetch } from '@/lib/shopify';
import {
  cartCreateMutation,
  cartLinesAddMutation,
  cartLinesRemoveMutation,
  cartLinesUpdateMutation,
  getCartQuery,
} from '@/lib/queries';
import type { Cart } from '@/lib/types';

function toMerchId(variantId: string) {
  return variantId.startsWith('gid://shopify/ProductVariant/')
    ? variantId
    : `gid://shopify/ProductVariant/${variantId}`;
}

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  if (!cartId) return NextResponse.json({ cart: null });
  try {
    const { data } = await shopifyFetch<{ cart: Cart | null }>({
      query: getCartQuery,
      variables: { cartId },
    });
    return NextResponse.json({ cart: data.cart ?? null });
  } catch (e) {
    return NextResponse.json({ cart: null }, { status: 200 });
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    variantId?: string;
    quantity?: number;
  };
  const variantId = body.variantId;
  const quantity = Math.max(1, Number(body.quantity ?? 1));
  if (!variantId)
    return NextResponse.json({ error: 'variantId required' }, { status: 400 });

  const cookieStore = await cookies();
  const existingCartId = cookieStore.get('cartId')?.value;
  let cart: Cart | null = null;
  if (!existingCartId) {
    const { data } = await shopifyFetch<{
      cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
    }>({
      query: cartCreateMutation,
      variables: {
        input: { lines: [{ merchandiseId: toMerchId(variantId), quantity }] },
      },
    });
    cart = data.cartCreate.cart;
    if (cart?.id)
      cookieStore.set('cartId', cart.id, { path: '/', httpOnly: false });
  } else {
    const { data } = await shopifyFetch<{
      cartLinesAdd: { cart: Cart | null; userErrors: { message: string }[] };
    }>({
      query: cartLinesAddMutation,
      variables: {
        cartId: existingCartId,
        lines: [{ merchandiseId: toMerchId(variantId), quantity }],
      },
    });
    cart = data.cartLinesAdd.cart;
  }
  return NextResponse.json({ cart });
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      lineId?: string;
      quantity?: number;
    };
    const { lineId } = body;
    const quantity = Number(body.quantity);
    if (!lineId || !Number.isFinite(quantity)) {
      return NextResponse.json(
        { error: 'lineId and quantity required' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;
    if (!cartId) {
      const { data } = await shopifyFetch<{
        cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
      }>({
        query: cartCreateMutation,
        variables: { input: {} },
      });
      const created = data.cartCreate.cart ?? null;
      if (created?.id) {
        cookieStore.set('cartId', created.id, { path: '/', httpOnly: false });
      }
      return NextResponse.json({ cart: created });
    }

    const { data } = await shopifyFetch<{
      cartLinesUpdate: {
        cart: Cart | null;
        userErrors: { message: string }[];
      };
    }>({
      query: cartLinesUpdateMutation,
      variables: { cartId, lines: [{ id: lineId, quantity }] },
    });
    return NextResponse.json({ cart: data.cartLinesUpdate.cart });
  } catch (e) {
    return NextResponse.json({ error: 'Shopify API failure' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { lineId?: string };
    const { lineId } = body;
    if (!lineId) {
      return NextResponse.json({ error: 'lineId required' }, { status: 400 });
    }
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;
    if (!cartId) {
      const { data } = await shopifyFetch<{
        cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
      }>({
        query: cartCreateMutation,
        variables: { input: {} },
      });
      const created = data.cartCreate.cart ?? null;
      if (created?.id) {
        cookieStore.set('cartId', created.id, { path: '/', httpOnly: false });
      }
      return NextResponse.json({ cart: created });
    }

    const { data } = await shopifyFetch<{
      cartLinesRemove: {
        cart: Cart | null;
        userErrors: { message: string }[];
      };
    }>({
      query: cartLinesRemoveMutation,
      variables: { cartId, lineIds: [lineId] },
    });
    return NextResponse.json({ cart: data.cartLinesRemove.cart });
  } catch (e) {
    return NextResponse.json({ error: 'Shopify API failure' }, { status: 500 });
  }
}
