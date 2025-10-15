import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { getCart } from '@/lib/cart';
import { z } from 'zod';

// Input validation schema
const checkoutSchema = z.object({
  cartId: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

// GraphQL query to get checkout URL from cart
const GET_CHECKOUT_URL = `
  query GetCheckoutUrl($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * POST /api/checkout
 * Generate a secure checkout URL for the current cart
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { cartId: providedCartId, returnUrl } = validationResult.data;

    // Get cart ID from cookie if not provided
    let cartId = providedCartId;
    if (!cartId) {
      const cartIdCookie = request.cookies.get('cartId');
      if (!cartIdCookie) {
        return NextResponse.json(
          { error: 'No cart found. Please add items to your cart first.' },
          { status: 400 },
        );
      }
      cartId = cartIdCookie.value;
    }

    // Validate cart ID format
    if (!cartId.startsWith('gid://shopify/Cart/')) {
      return NextResponse.json(
        { error: 'Invalid cart ID format' },
        { status: 400 },
      );
    }

    // Fetch cart details and checkout URL from Shopify
    const { data } = await shopifyFetch<{
      cart: {
        id: string;
        checkoutUrl: string;
        totalQuantity: number;
        cost: {
          totalAmount: {
            amount: string;
            currencyCode: string;
          };
        };
        lines: {
          edges: Array<{
            node: {
              id: string;
              quantity: number;
              merchandise: {
                id: string;
                title: string;
                price: {
                  amount: string;
                  currencyCode: string;
                };
                product: {
                  id: string;
                  title: string;
                  handle: string;
                };
              };
            };
          }>;
        };
      };
    }>({
      query: GET_CHECKOUT_URL,
      variables: {
        cartId,
      },
    });

    const cart = data?.cart;

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found or expired. Please try again.' },
        { status: 404 },
      );
    }

    if (cart.totalQuantity === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before checking out.' },
        { status: 400 },
      );
    }

    // Validate checkout URL
    if (!cart.checkoutUrl || !cart.checkoutUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Invalid checkout URL generated. Please try again.' },
        { status: 500 },
      );
    }

    // Use the checkout URL directly from Shopify
    let checkoutUrl = cart.checkoutUrl;

    // Add return URL if provided
    if (returnUrl) {
      try {
        const url = new URL(checkoutUrl);
        url.searchParams.set('return_to', returnUrl);
        checkoutUrl = url.toString();
      } catch (error) {
        console.error('Failed to add return URL:', error);
      }
    }

    // Log checkout attempt for analytics (without sensitive data)
    console.log('Checkout initiated', {
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      totalAmount: cart.cost.totalAmount.amount,
      currency: cart.cost.totalAmount.currencyCode,
      timestamp: new Date().toISOString(),
    });

    // Prepare checkout data for response
    const checkoutData = {
      checkoutUrl,
      cartId: cart.id,
      totalQuantity: cart.totalQuantity,
      totalAmount: cart.cost.totalAmount,
      items: cart.lines.edges.map((edge) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        title: edge.node.merchandise.product.title,
        variant: edge.node.merchandise.title,
        price: edge.node.merchandise.price,
        productHandle: edge.node.merchandise.product.handle,
      })),
    };

    // Add cache headers to prevent caching of checkout URLs
    const res = NextResponse.json(checkoutData, { status: 200 });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');

    return res;
  } catch (error) {
    console.error('Checkout API error:', error);

    // Don't leak internal error details
    return NextResponse.json(
      { error: 'Failed to create checkout. Please try again.' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/checkout
 * Get checkout status and validate cart
 */
export async function GET(request: NextRequest) {
  try {
    // Get cart ID from cookie
    const cartIdCookie = request.cookies.get('cartId');

    if (!cartIdCookie) {
      return NextResponse.json(
        {
          hasCart: false,
          message: 'No active cart found',
        },
        { status: 200 },
      );
    }

    // Validate cart exists and has items
    const cart = await getCart();

    if (!cart || cart.totalQuantity === 0) {
      return NextResponse.json(
        {
          hasCart: false,
          message: 'Cart is empty or expired',
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        hasCart: true,
        cartId: cart.id,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.cost?.totalAmount,
        checkoutReady: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Checkout status error:', error);

    return NextResponse.json(
      {
        hasCart: false,
        message: 'Failed to check cart status',
      },
      { status: 500 },
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
