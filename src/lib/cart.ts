// client-safe helper for fetching cart

import type { Cart } from '@/lib/types';

export async function getCart(): Promise<Cart | null> {
  try {
    const res = await fetch('/api/cart', {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { cart: Cart | null };
    return json.cart ?? null;
  } catch {
    return null;
  }
}
