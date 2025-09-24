import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customer';
import {
  generateTokens,
  setRefreshTokenCookie,
  clearAuthCookies,
} from '@/lib/auth/jwt';
import { z } from 'zod';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Rate limiting tracker (in production, use Redis)
const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if IP is rate limited
 */
function isRateLimited(ip: string): boolean {
  const attempt = loginAttempts.get(ip);
  if (!attempt) return false;

  const now = Date.now();
  if (now - attempt.timestamp > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return false;
  }

  return attempt.count >= MAX_ATTEMPTS;
}

/**
 * Track login attempt
 */
function trackLoginAttempt(ip: string, success: boolean) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (success) {
    loginAttempts.delete(ip);
    return;
  }

  if (!attempt) {
    loginAttempts.set(ip, { count: 1, timestamp: now });
  } else {
    attempt.count++;
    attempt.timestamp = now;
  }
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    // Check rate limiting
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: 900, // 15 minutes in seconds
        },
        { status: 429 },
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 401 },
      );
    }

    const { email, password } = validationResult.data;

    // Authenticate with Shopify Customer API
    const { accessToken: shopifyToken, errors } = await customerService.login({
      email,
      password,
    });

    // Handle authentication errors
    if (errors && errors.length > 0) {
      trackLoginAttempt(clientIp, false);

      // Generic error message to prevent user enumeration
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    if (!shopifyToken) {
      trackLoginAttempt(clientIp, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Get customer details from Shopify
    const customer = await customerService.getCustomer(shopifyToken.accessToken);

    if (!customer) {
      trackLoginAttempt(clientIp, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokens(
      customer.id,
      customer.email,
      shopifyToken.accessToken, // Store Shopify token securely in refresh token
    );

    // Clear any existing auth cookies and set new refresh token
    const clearCookies = clearAuthCookies();
    const refreshTokenCookie = setRefreshTokenCookie(refreshToken);

    // Track successful login
    trackLoginAttempt(clientIp, true);

    // Prepare user data (exclude sensitive information)
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

    // Log successful login (without sensitive data)
    console.log(`Successful login for user: ${customer.email} from IP: ${clientIp}`);

    // Return success response with access token and user data
    const response = NextResponse.json(
      {
        accessToken,
        user,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer',
      },
      { status: 200 },
    );

    // Set cookies
    [...clearCookies, refreshTokenCookie].forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    console.error('Login error:', error);

    // Track failed attempt
    trackLoginAttempt(clientIp, false);

    // Don't leak internal error details
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 },
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}