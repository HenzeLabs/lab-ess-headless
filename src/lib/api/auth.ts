import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';

/**
 * Admin user configuration
 * In production, this should be stored in a database with proper role management
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

/**
 * Verify that the request has a valid authentication token
 * Returns null if authenticated, or an error response if not
 */
export async function requireAuth(
  request?: NextRequest,
): Promise<null | NextResponse> {
  try {
    // Try to get token from Authorization header first
    let token: string | null = null;

    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Fallback to cookie if no Authorization header
    if (!token) {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth_token');
      token = authCookie?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Verify the token
    await verifyAccessToken(token);

    // Token is valid
    return null;
  } catch (error) {
    console.error('Authentication verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid or expired authentication token' },
      { status: 401 },
    );
  }
}

/**
 * Verify that the request has a valid admin authentication token
 * Returns null if authenticated as admin, or an error response if not
 */
export async function requireAdmin(
  request?: NextRequest,
): Promise<null | NextResponse> {
  try {
    // First check basic authentication
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    // Get token to verify admin status
    let token: string | null = null;

    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth_token');
      token = authCookie?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Verify token and check admin status
    const payload = await verifyAccessToken(token);

    // Check if user's email is in the admin list
    if (!ADMIN_EMAILS.includes(payload.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      );
    }

    // User is authenticated and is an admin
    return null;
  } catch (error) {
    console.error('Admin verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid or expired authentication token' },
      { status: 401 },
    );
  }
}

/**
 * Get the authenticated user's information from the request
 * Returns user payload or null if not authenticated
 */
export async function getAuthenticatedUser(request?: NextRequest) {
  try {
    let token: string | null = null;

    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth_token');
      token = authCookie?.value || null;
    }

    if (!token) {
      return null;
    }

    const payload = await verifyAccessToken(token);
    return payload;
  } catch (error) {
    console.error('Failed to get authenticated user:', error);
    return null;
  }
}
