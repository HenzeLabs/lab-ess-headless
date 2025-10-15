import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, getAccessTokenFromHeader } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware to protect API routes with JWT authentication
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    // Get access token from Authorization header
    const token = getAccessTokenFromHeader(request);

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 },
      );
    }

    // Verify the access token
    const payload = await verifyAccessToken(token);

    // Add user info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: payload.sub!,
      email: payload.email,
    };

    // Call the handler with authenticated request
    return await handler(authenticatedRequest);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 },
    );
  }
}

/**
 * Optional authentication middleware - doesn't require auth but adds user if present
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    // Get access token from Authorization header
    const token = getAccessTokenFromHeader(request);

    if (token) {
      try {
        // Try to verify the token
        const payload = await verifyAccessToken(token);

        // Add user info to request if valid
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = {
          id: payload.sub!,
          email: payload.email,
        };
      } catch {
        // Token is invalid, but continue without auth
      }
    }

    // Call the handler (with or without auth)
    return await handler(request as AuthenticatedRequest);
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue without auth
    return await handler(request as AuthenticatedRequest);
  }
}