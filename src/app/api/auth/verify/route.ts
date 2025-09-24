import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(request: AuthenticatedRequest) {
  try {
    // User is already verified by withAuth middleware
    if (!request.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    // Optionally fetch fresh customer data from Shopify
    // This is useful to ensure the customer still exists and get latest data
    // But it adds latency, so you might want to skip this for performance

    const response = NextResponse.json(
      {
        authenticated: true,
        user: {
          id: request.user.id,
          email: request.user.email,
        },
      },
      { status: 200 },
    );

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handler);
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