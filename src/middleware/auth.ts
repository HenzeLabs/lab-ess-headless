import { NextRequest, NextResponse } from 'next/server';

/**
 * Authentication configuration for API endpoints
 */
export const authConfig = {
  // Admin token for configuration API
  adminToken: process.env.CONFIG_ADMIN_TOKEN || process.env.ADMIN_TOKEN,

  // Allowed IPs for development (optional)
  allowedIPs: (process.env.ALLOWED_IPS || '').split(',').filter(Boolean),

  // Allow local development without auth
  allowLocalDev: process.env.NODE_ENV === 'development',
};

/**
 * Extract client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP.trim();
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  if (remoteAddr) return remoteAddr.trim();

  return '127.0.0.1';
}

/**
 * Check if request is from localhost
 */
export function isLocalhost(request: NextRequest): boolean {
  const ip = getClientIP(request);
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
}

/**
 * Verify admin authentication
 * Returns { authorized: true } or { authorized: false, reason: string }
 */
export function verifyAdminAuth(request: NextRequest): {
  authorized: boolean;
  reason?: string;
  user?: string;
} {
  // Allow local development without auth if configured
  if (authConfig.allowLocalDev && isLocalhost(request)) {
    return {
      authorized: true,
      user: 'localhost-dev',
    };
  }

  // Check for admin token
  const authHeader = request.headers.get('authorization');
  const tokenHeader = request.headers.get('x-admin-token');

  // Extract token from Authorization header (Bearer token)
  let providedToken: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (tokenHeader) {
    providedToken = tokenHeader;
  }

  // Verify token
  if (!authConfig.adminToken) {
    // No admin token configured - reject in production
    if (process.env.NODE_ENV === 'production') {
      return {
        authorized: false,
        reason: 'Admin authentication is not configured',
      };
    }
    // Allow in development if no token is set
    return {
      authorized: true,
      user: 'dev-no-auth',
    };
  }

  if (!providedToken) {
    return {
      authorized: false,
      reason:
        'Missing authentication token. Provide via Authorization: Bearer <token> or X-Admin-Token header',
    };
  }

  if (providedToken !== authConfig.adminToken) {
    return {
      authorized: false,
      reason: 'Invalid authentication token',
    };
  }

  // Check IP allowlist if configured
  if (authConfig.allowedIPs.length > 0) {
    const clientIP = getClientIP(request);
    if (!authConfig.allowedIPs.includes(clientIP)) {
      return {
        authorized: false,
        reason: `IP address ${clientIP} is not authorized`,
      };
    }
  }

  // Extract user from token or use generic admin
  return {
    authorized: true,
    user: 'admin',
  };
}

/**
 * Middleware wrapper to protect routes
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { user: string },
  ) => Promise<NextResponse> | NextResponse,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = verifyAdminAuth(request);

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          reason: authResult.reason,
          hint: 'Provide a valid admin token via Authorization: Bearer <token> or X-Admin-Token header',
        },
        { status: 401 },
      );
    }

    // Call the original handler with auth context
    return handler(request, { user: authResult.user! });
  };
}

/**
 * Log authentication attempts for audit trail
 */
export function logAuthAttempt(
  request: NextRequest,
  success: boolean,
  reason?: string,
) {
  const ip = getClientIP(request);
  const timestamp = new Date().toISOString();
  const method = request.method;
  const path = request.nextUrl.pathname;

  const logEntry = {
    timestamp,
    ip,
    method,
    path,
    success,
    reason: reason || (success ? 'Authorized' : 'Unauthorized'),
  };

  // Log to console (in production, this should go to a logging service)
  console.log('[AUTH]', JSON.stringify(logEntry));

  // TODO: In production, send to centralized logging service
  // Example: await logService.log(logEntry);
}
