// client-safe helper for fetching cart

import type { Cart } from '@/lib/types';

export async function getCart(timeoutMs: number = 8000): Promise<Cart | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('/api/cart', {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = (await res.json()) as { cart: Cart | null };
    return json.cart ?? null;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Cart fetch timed out after', timeoutMs, 'ms');
    }
    return null;
  }
}
