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
    if (process.env.NODE_ENV !== 'production') {
      console.log('GET /api/cart - Shopify Cart Data:', JSON.stringify(data.cart, null, 2));
      console.log('GET /api/cart - checkoutUrl:', data.cart?.checkoutUrl);
    }
    return NextResponse.json({ cart: data.cart ?? null });
  } catch (e) {
    console.error('GET /api/cart - Error fetching cart:', e);
    return NextResponse.json({ error: 'Shopify API failure' }, { status: 500 });
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

    // Check for Shopify errors
    const userErrors = data.cartCreate.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error('POST /api/cart - Shopify errors:', userErrors);
      return NextResponse.json(
        { error: userErrors[0].message },
        { status: 400 }
      );
    }

    cart = data.cartCreate.cart;
    if (cart?.id) {
      const response = NextResponse.json({ cart });
      response.cookies.set('cartId', cart.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('POST /api/cart - New Cart Created:', JSON.stringify(cart, null, 2));
        console.log('POST /api/cart - checkoutUrl (new cart):', cart?.checkoutUrl);
      }
      return response;
    }
    console.error('POST /api/cart - Cart creation failed: No cart returned');
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

    // Check for Shopify errors
    const userErrors = data.cartLinesAdd.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error('POST /api/cart - Shopify errors adding lines:', userErrors);
      return NextResponse.json(
        { error: userErrors[0].message },
        { status: 400 }
      );
    }

    cart = data.cartLinesAdd.cart;
    if (process.env.NODE_ENV !== 'production') {
      console.log('POST /api/cart - Item Added to Existing Cart:', JSON.stringify(cart, null, 2));
      console.log('POST /api/cart - checkoutUrl (existing cart):', cart?.checkoutUrl);
    }
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
        cookieStore.set('cartId', created.id, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
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
        cookieStore.set('cartId', created.id, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
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
