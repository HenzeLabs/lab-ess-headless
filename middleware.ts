import { NextRequest, NextResponse } from 'next/server';
// import {
//   RateLimiter,
//   securityHeaders,
//   validateCSRF,
// } from './src/lib/security/middleware';
import {
  verifyAccessToken,
  getAccessTokenFromHeader,
} from './src/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Apply security middleware
  // const securityResponse = await withSecurity(request);
  // if (securityResponse) {
  //   return securityResponse;
  // }

  // Handle authentication for protected routes
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/account', '/api/orders', '/api/customer'];

  const publicRoutes = [
    '/account/login',
    '/account/register',
    '/account/forgot-password',
    '/account/reset-password',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/recover',
    '/api/auth/reset',
  ];

  // Check if this is a protected route
  const isProtected =
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !publicRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Check for JWT token
    const accessToken = getAccessTokenFromHeader(request);
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      // No tokens, redirect to login
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/account/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate access token
    if (accessToken) {
      try {
        const payload = await verifyAccessToken(accessToken);
        // Add user info to request headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.sub || '');
        requestHeaders.set('x-user-email', payload.email || '');

        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        // return addSecurityHeaders(response);
        return response;
      } catch (error) {
        // Access token is invalid or expired
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        // For web routes, let client handle refresh
        const response = NextResponse.next();
        // return addSecurityHeaders(response);
        return response;
      }
    }
  }

  // Continue with normal response and add security headers
  const response = NextResponse.next();
  // return addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
