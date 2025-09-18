import { NextResponse } from 'next/server';
import { addCartLineAction } from '@/app/cart/actions';

export async function GET() {
  // IMPORTANT: Replace 'YOUR_SHOPIFY_VARIANT_ID' with a real product variant ID from your Shopify store.
  // You can find this in your Shopify admin under a product's variant details.
  const variantId = '42307406954555'; 
  const quantity = 1;

  if (variantId === 'YOUR_SHOPIFY_VARIANT_ID') {
    return NextResponse.json({ error: 'Please replace YOUR_SHOPIFY_VARIANT_ID with a real variant ID.' }, { status: 400 });
  }

  try {
    const cart = await addCartLineAction(variantId, quantity);
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('Error in test-cart API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
