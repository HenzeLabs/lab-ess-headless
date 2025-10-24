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

type CartLineBody = {
  merchandiseId?: unknown;
  variantId?: unknown;
  quantity?: unknown;
};

type PostBody = {
  cartId?: unknown;
  lines?: CartLineBody[];
  variantId?: unknown;
  quantity?: unknown;
};

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function toMerchId(variantId: string) {
  return variantId.startsWith('gid://shopify/ProductVariant/')
    ? variantId
    : `gid://shopify/ProductVariant/${variantId}`;
}

function normalizeCartId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.startsWith('gid://shopify/Cart/') ? trimmed : null;
}

function normalizeQuantity(value: unknown): number {
  const quantity = Number(value ?? 1);
  return Number.isFinite(quantity) && quantity > 0
    ? Math.floor(quantity)
    : 1;
}

function ensureMerchandiseId(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const merchId = toMerchId(value.trim());
  // Guard against product IDs being passed through incorrectly
  if (merchId.includes('ProductVariant/gid://shopify/Product/')) {
    return null;
  }
  return merchId;
}

function extractCartLines(body: PostBody): { merchandiseId: string; quantity: number }[] {
  const explicitLines = Array.isArray(body.lines) ? body.lines : [];
  const normalizedLines = explicitLines
    .map((line) => {
      const merchandiseId =
        ensureMerchandiseId(line.merchandiseId) ??
        ensureMerchandiseId(line.variantId);

      if (!merchandiseId) return null;
      return {
        merchandiseId,
        quantity: normalizeQuantity(line.quantity),
      };
    })
    .filter((line): line is { merchandiseId: string; quantity: number } => Boolean(line));

  if (normalizedLines.length > 0) return normalizedLines;

  const fallbackMerchandiseId =
    ensureMerchandiseId(body.variantId) ?? null;

  if (!fallbackMerchandiseId) return [];

  return [
    {
      merchandiseId: fallbackMerchandiseId,
      quantity: normalizeQuantity(body.quantity),
    },
  ];
}

function setCartCookie(response: NextResponse, cartId: string) {
  const normalized = normalizeCartId(cartId);
  if (!normalized) return;

  response.cookies.set('cartId', normalized, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedCartId = normalizeCartId(url.searchParams.get('cartId'));
  const cookieStore = await cookies();
  const cookieCartId = normalizeCartId(cookieStore.get('cartId')?.value);
  const cartId = providedCartId ?? cookieCartId;

  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const { data } = await shopifyFetch<{ cart: Cart | null }>({
      query: getCartQuery,
      variables: { cartId },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        'GET /api/cart - Shopify Cart Data:',
        JSON.stringify(data.cart, null, 2),
      );
      console.log('GET /api/cart - checkoutUrl:', data.cart?.checkoutUrl);
    }

    const response = NextResponse.json({ cart: data.cart ?? null });

    if (data.cart?.id) {
      setCartCookie(response, data.cart.id);
    }

    return response;
  } catch (error) {
    console.error('GET /api/cart - Error fetching cart:', error);
    return NextResponse.json({ error: 'Shopify API failure' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as PostBody;
    const lines = extractCartLines(body);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'At least one merchandiseId is required' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const cookieCartId = normalizeCartId(cookieStore.get('cartId')?.value);
    const providedCartId = normalizeCartId(body.cartId);
    const cartId = providedCartId ?? cookieCartId;

    if (!cartId) {
      const { data } = await shopifyFetch<{
        cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
      }>({
        query: cartCreateMutation,
        variables: { input: { lines } },
      });

      const userErrors = data.cartCreate.userErrors;
      if (userErrors?.length) {
        console.error('POST /api/cart - Shopify errors:', userErrors);
        return NextResponse.json(
          { error: userErrors[0]?.message ?? 'Unable to create cart' },
          { status: 400 },
        );
      }

      const cart = data.cartCreate.cart;
      if (!cart?.id) {
        console.error('POST /api/cart - Cart creation failed: missing cart ID');
        return NextResponse.json(
          { error: 'Cart creation failed' },
          { status: 500 },
        );
      }

      const response = NextResponse.json({ cart });
      setCartCookie(response, cart.id);

      return response;
    }

    const { data } = await shopifyFetch<{
      cartLinesAdd: { cart: Cart | null; userErrors: { message: string }[] };
    }>({
      query: cartLinesAddMutation,
      variables: { cartId, lines },
    });

    const userErrors = data.cartLinesAdd.userErrors;
    if (userErrors?.length) {
      console.error('POST /api/cart - Shopify errors adding lines:', userErrors);
      return NextResponse.json(
        { error: userErrors[0]?.message ?? 'Unable to add to cart' },
        { status: 400 },
      );
    }

    const cart = data.cartLinesAdd.cart ?? null;
    const response = NextResponse.json({ cart });

    if (cart?.id) {
      setCartCookie(response, cart.id);
    }

    return response;
  } catch (error) {
    console.error('POST /api/cart - Unexpected error:', error);
    return NextResponse.json({ error: 'Shopify API failure' }, { status: 500 });
  }
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
    const cartId = normalizeCartId(cookieStore.get('cartId')?.value);
    if (!cartId) {
      const { data } = await shopifyFetch<{
        cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
      }>({
        query: cartCreateMutation,
        variables: { input: {} },
      });
      const created = data.cartCreate.cart ?? null;
      const response = NextResponse.json({ cart: created });
      if (created?.id) {
        setCartCookie(response, created.id);
      }
      return response;
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
    const cartId = normalizeCartId(cookieStore.get('cartId')?.value);
    if (!cartId) {
      const { data } = await shopifyFetch<{
        cartCreate: { cart: Cart | null; userErrors: { message: string }[] };
      }>({
        query: cartCreateMutation,
        variables: { input: {} },
      });
      const created = data.cartCreate.cart ?? null;
      const response = NextResponse.json({ cart: created });
      if (created?.id) {
        setCartCookie(response, created.id);
      }
      return response;
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
