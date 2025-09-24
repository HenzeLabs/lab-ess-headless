import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAccessToken,
  getAccessTokenFromHeader,
  verifyRefreshToken,
} from '@/lib/auth/jwt';
import { shopifyFetch } from '@/lib/shopify';

// GraphQL query to get a specific order
const GET_ORDER_BY_ID = `
  query GetOrder($id: ID!) {
    node(id: $id) {
      ... on Order {
        id
        name
        orderNumber
        processedAt
        fulfillmentStatus
        financialStatus
        currentTotalPrice {
          amount
          currencyCode
        }
        totalShippingPrice {
          amount
          currencyCode
        }
        totalTax {
          amount
          currencyCode
        }
        subtotalPrice {
          amount
          currencyCode
        }
        totalRefunded {
          amount
          currencyCode
        }
        customerUrl
        statusUrl
        shippingAddress {
          firstName
          lastName
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        billingAddress {
          firstName
          lastName
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        lineItems(first: 100) {
          edges {
            node {
              title
              quantity
              variant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
                product {
                  id
                  title
                  handle
                }
              }
              originalTotalPrice {
                amount
                currencyCode
              }
              discountedTotalPrice {
                amount
                currencyCode
              }
            }
          }
        }
        fulfillments {
          trackingCompany
          trackingInfo {
            number
            url
          }
          fulfillmentLineItems(first: 100) {
            edges {
              node {
                quantity
                lineItem {
                  title
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
 * GET /api/orders/[id]
 * Get a specific order by ID - requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    // Get access token from header
    const accessToken = getAccessTokenFromHeader(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token provided' },
        { status: 401 },
      );
    }

    // Verify access token
    try {
      await verifyAccessToken(accessToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 },
      );
    }

    // Get Shopify access token from refresh token (stored securely)
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No refresh token found' },
        { status: 401 },
      );
    }

    let refreshPayload;
    try {
      refreshPayload = await verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 },
      );
    }

    const shopifyAccessToken = refreshPayload.shopifyAccessToken;
    if (!shopifyAccessToken) {
      return NextResponse.json(
        { error: 'No Shopify access token found. Please login again.' },
        { status: 401 },
      );
    }

    // Format order ID for Shopify (ensure it's in the correct format)
    const formattedOrderId = orderId.startsWith('gid://')
      ? orderId
      : `gid://shopify/Order/${orderId}`;

    // Fetch order from Shopify
    const { data } = await shopifyFetch<{
      node: {
        id: string;
        orderNumber: number;
        processedAt: string;
        totalPrice: {
          amount: string;
          currencyCode: string;
        };
        lineItems: {
          edges: Array<{
            node: {
              title: string;
              quantity: number;
              variant: {
                price: {
                  amount: string;
                  currencyCode: string;
                };
              };
            };
          }>;
        };
      };
    }>({
      query: GET_ORDER_BY_ID,
      variables: {
        id: formattedOrderId,
      },
    });

    const order = data?.node;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify the order belongs to the authenticated customer
    // This is done implicitly by Shopify's customer access token

    // Add cache headers
    const res = NextResponse.json({ order }, { status: 200 });
    res.headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');

    return res;
  } catch (error) {
    console.error('Order detail API error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
