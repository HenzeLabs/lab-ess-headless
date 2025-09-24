import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyRefreshToken,
  generateTokens,
  setRefreshTokenCookie,
  clearAuthCookies,
  extractCustomerInfo,
} from '@/lib/auth/jwt';
import { customerService } from '@/lib/services/customer';

export async function POST(_request: NextRequest) {
  try {
    // Get refresh token from cookie
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get('refreshToken');

    if (!refreshTokenCookie?.value) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 },
      );
    }

    // Verify refresh token
    let tokenPayload;
    try {
      tokenPayload = await verifyRefreshToken(refreshTokenCookie.value);
    } catch (error) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 },
      );

      clearAuthCookies().forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });

      return response;
    }

    // Extract customer info from token
    const { id, shopifyAccessToken } = extractCustomerInfo(tokenPayload);

    // Verify the customer still exists and is active
    let customer = null;
    if (shopifyAccessToken) {
      try {
        customer = await customerService.getCustomer(shopifyAccessToken);
      } catch (error) {
        console.error('Failed to verify customer:', error);
      }
    }

    // If customer verification fails, clear cookies and return error
    if (!customer || customer.id !== id) {
      const response = NextResponse.json(
        { error: 'Customer verification failed' },
        { status: 401 },
      );

      clearAuthCookies().forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });

      return response;
    }

    // Generate new token pair
    const { accessToken, refreshToken } = await generateTokens(
      customer.id,
      customer.email,
      shopifyAccessToken,
    );

    // Set new refresh token cookie
    const newRefreshTokenCookie = setRefreshTokenCookie(refreshToken);

    // Prepare user data
    const user = {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      displayName: customer.displayName,
      phone: customer.phone,
      acceptsMarketing: customer.acceptsMarketing,
      createdAt: customer.createdAt,
    };

    // Return new tokens
    const response = NextResponse.json(
      {
        accessToken,
        user,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer',
      },
      { status: 200 },
    );

    // Set new refresh token cookie
    response.headers.append('Set-Cookie', newRefreshTokenCookie);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);

    // Don't leak internal error details
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 },
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}