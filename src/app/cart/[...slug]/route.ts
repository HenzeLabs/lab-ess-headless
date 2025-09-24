import { NextRequest } from 'next/server';
import { notFound, redirect } from 'next/navigation';

/**
 * Handle alternative Shopify cart checkout URLs like /cart/CART_ID:KEY
 * This is another format Shopify uses for checkout redirects
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return notFound();
  }

  // Handle the format: /cart/CART_ID:KEY
  const fullPath = slug.join('/');

  // Check if this contains the colon format
  if (fullPath.includes(':')) {
    const [cartId, key] = fullPath.split(':');

    if (!cartId || !key) {
      return notFound();
    }

    // Try a different Shopify checkout URL format
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopifyDomain) {
      console.error('SHOPIFY_STORE_DOMAIN not configured');
      return notFound();
    }

    // For actual checkout, we might need to use the checkouts endpoint
    const checkoutUrl = `https://${shopifyDomain}/checkouts/${cartId}?key=${key}`;

    // Redirect to the actual Shopify checkout
    redirect(checkoutUrl);
  }

  return notFound();
}
