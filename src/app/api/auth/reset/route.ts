import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { z } from 'zod';
import { generateTokens, setRefreshTokenCookie, clearAuthCookies } from '@/lib/auth/jwt';

// Input validation schema
const resetSchema = z.object({
  resetUrl: z.string().url('Invalid reset URL'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// GraphQL mutation for password reset
const CUSTOMER_RESET = `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
        email
        firstName
        lastName
        displayName
        phone
        acceptsMarketing
        createdAt
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Extract customer ID and reset token from Shopify reset URL
 */
function parseResetUrl(resetUrl: string): { customerId: string; resetToken: string } | null {
  try {
    const url = new URL(resetUrl);
    const pathParts = url.pathname.split('/');

    // Shopify reset URL format: /account/reset/{customerId}/{resetToken}
    const resetIndex = pathParts.indexOf('reset');
    if (resetIndex === -1 || resetIndex + 2 >= pathParts.length) {
      return null;
    }

    const customerId = `gid://shopify/Customer/${pathParts[resetIndex + 1]}`;
    const resetToken = pathParts[resetIndex + 2];

    return { customerId, resetToken };
  } catch (error) {
    console.error('Failed to parse reset URL:', error);
    return null;
  }
}

/**
 * POST /api/auth/reset
 * Reset customer password with reset token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Validate input
    const validationResult = resetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { resetUrl, password } = validationResult.data;

    // Parse reset URL to extract customer ID and token
    const resetParams = parseResetUrl(resetUrl);
    if (!resetParams) {
      return NextResponse.json(
        {
          error: 'Invalid or expired reset link',
        },
        { status: 400 },
      );
    }

    const { customerId, resetToken } = resetParams;

    // Reset password via Shopify
    const response = await shopifyFetch<any>({
      query: CUSTOMER_RESET,
      variables: {
        id: customerId,
        input: {
          resetToken,
          password,
        },
      },
    });

    const { customer, customerAccessToken, customerUserErrors } = response.data.customerReset;

    // Handle errors
    if (customerUserErrors && customerUserErrors.length > 0) {
      const errorMessage = customerUserErrors[0]?.message || 'Invalid or expired reset link';
      return NextResponse.json(
        {
          error: errorMessage,
          code: customerUserErrors[0]?.code,
        },
        { status: 400 },
      );
    }

    if (!customer || !customerAccessToken) {
      return NextResponse.json(
        {
          error: 'Invalid or expired reset link',
        },
        { status: 400 },
      );
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokens(
      customer.id,
      customer.email,
      customerAccessToken.accessToken,
    );

    // Clear any existing auth cookies and set new refresh token
    const clearCookies = clearAuthCookies();
    const refreshTokenCookie = setRefreshTokenCookie(refreshToken);

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

    // Log successful password reset (without sensitive data)
    console.log(`Successful password reset for user: ${customer.email}`);

    // Return success response with access token and user data
    const successResponse = NextResponse.json(
      {
        success: true,
        accessToken,
        user,
        expiresIn: 900, // 15 minutes in seconds
        tokenType: 'Bearer',
        message: 'Password reset successful. You are now logged in.',
      },
      { status: 200 },
    );

    // Set cookies
    [...clearCookies, refreshTokenCookie].forEach((cookie) => {
      successResponse.headers.append('Set-Cookie', cookie);
    });

    // Add security headers
    successResponse.headers.set('X-Content-Type-Options', 'nosniff');
    successResponse.headers.set('X-Frame-Options', 'DENY');
    successResponse.headers.set('X-XSS-Protection', '1; mode=block');
    successResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return successResponse;
  } catch (error) {
    console.error('Password reset error:', error);

    // Don't leak internal error details
    return NextResponse.json(
      {
        error: 'Failed to reset password. Please try again or request a new reset link.',
      },
      { status: 500 },
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