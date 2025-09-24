import { NextRequest } from 'next/server';
import { notFound, redirect } from 'next/navigation';

/**
 * Handle Shopify checkout URLs like /checkouts/CHECKOUT_ID?key=KEY
 * These should redirect back to the proper Shopify-hosted checkout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');

  if (!id) {
    return notFound();
  }

  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!shopifyDomain) {
    console.error('SHOPIFY_STORE_DOMAIN not configured');
    return notFound();
  }

  // Build the final Shopify checkout URL
  let checkoutUrl = `https://${shopifyDomain}/checkouts/${id}`;
  if (key) {
    checkoutUrl += `?key=${key}`;
  }

  // This should be the final redirect to the actual Shopify checkout
  redirect(checkoutUrl);
}
