import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies } from '@/lib/auth/jwt';
import { customerService } from '@/lib/services/customer';

export async function POST() {
  try {
    // Get the refresh token to extract Shopify token if needed
    const cookieStore = await cookies();
    const customerToken = cookieStore.get('customer_token');

    // If there's a Shopify customer token, revoke it
    if (customerToken?.value) {
      try {
        await customerService.logout(customerToken.value);
      } catch (error) {
        // Log but don't fail the logout if Shopify revocation fails
        console.error('Failed to revoke Shopify token:', error);
      }
    }

    // Clear all auth cookies
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 },
    );

    // Clear authentication cookies
    clearAuthCookies().forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, clear the cookies
    const response = NextResponse.json(
      { message: 'Logged out' },
      { status: 200 },
    );

    clearAuthCookies().forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
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
