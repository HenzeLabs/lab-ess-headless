import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customer';
import { z } from 'zod';

// Input validation schema
const recoverSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

// Rate limiting tracker (in production, use Redis)
const recoveryAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Check if IP is rate limited
 */
function isRateLimited(ip: string): boolean {
  const attempt = recoveryAttempts.get(ip);
  if (!attempt) return false;

  const now = Date.now();
  if (now - attempt.timestamp > LOCKOUT_DURATION) {
    recoveryAttempts.delete(ip);
    return false;
  }

  return attempt.count >= MAX_ATTEMPTS;
}

/**
 * Track recovery attempt
 */
function trackRecoveryAttempt(ip: string) {
  const now = Date.now();
  const attempt = recoveryAttempts.get(ip);

  if (!attempt) {
    recoveryAttempts.set(ip, { count: 1, timestamp: now });
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

/**
 * POST /api/auth/recover
 * Send password recovery email
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    // Check rate limiting
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error: 'Too many recovery attempts. Please try again later.',
          retryAfter: 3600, // 1 hour in seconds
        },
        { status: 429 },
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate input
    const validationResult = recoverSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid email address',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = validationResult.data;

    // Track recovery attempt
    trackRecoveryAttempt(clientIp);

    // Send recovery email via Shopify
    const { success, errors } = await customerService.recoverPassword(email);

    // Always return success to prevent email enumeration
    // Log the actual result for monitoring
    if (!success || (errors && errors.length > 0)) {
      console.log(`Password recovery failed for email: ${email}`, errors);
    } else {
      console.log(`Password recovery email sent to: ${email}`);
    }

    // Always return success response to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Password recovery error:', error);

    // Don't leak internal error details
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      },
      { status: 200 },
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}