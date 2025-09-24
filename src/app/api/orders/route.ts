import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAccessToken,
  getAccessTokenFromHeader,
  verifyRefreshToken,
} from '@/lib/auth/jwt';
import { customerService } from '@/lib/services/customer';

/**
 * GET /api/orders
 * Get customer orders - requires authentication
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get('first') || '10');
    const after = searchParams.get('after') || undefined;

    // Fetch orders from Shopify
    const ordersData = await customerService.getCustomerOrders(
      shopifyAccessToken,
      {
        first,
        after,
      },
    );

    if (!ordersData) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 },
      );
    }

    // Format response with orders and pagination info
    const response = {
      orders: ordersData.orders.map((order) => ({
        cursor: ordersData.endCursor, // Use endCursor for all items
        ...order,
      })),
      pageInfo: {
        hasNextPage: ordersData.hasNextPage,
        hasPreviousPage: ordersData.hasPreviousPage,
        startCursor: ordersData.startCursor,
        endCursor: ordersData.endCursor,
      },
      totalCount: ordersData.totalCount,
    };

    // Add cache headers
    const res = NextResponse.json(response, { status: 200 });
    res.headers.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');

    return res;
  } catch (error) {
    console.error('Orders API error:', error);

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
