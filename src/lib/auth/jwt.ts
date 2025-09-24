import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Token configuration
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const ISSUER = 'lab-ess-headless';
const AUDIENCE = 'lab-ess-headless-api';

// Get secrets from environment variables
const getAccessTokenSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

const getRefreshTokenSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

// Token payload types
export interface TokenPayload extends JWTPayload {
  sub: string; // Customer ID
  email: string;
  shopifyAccessToken?: string; // Store the Shopify token securely
  type: 'access' | 'refresh';
}

export interface CustomerTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  payload: TokenPayload;
  protectedHeader: unknown;
}

/**
 * Generate access and refresh tokens for a customer
 */
export async function generateTokens(
  customerId: string,
  email: string,
  shopifyAccessToken?: string,
): Promise<CustomerTokens> {
  const now = Date.now() / 1000;

  // Create access token (short-lived)
  const accessToken = await new SignJWT({
    sub: customerId,
    email,
    type: 'access',
    // Don't include sensitive Shopify token in access token
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setNotBefore(now)
    .setJti(crypto.randomUUID())
    .sign(getAccessTokenSecret());

  // Create refresh token (long-lived)
  const refreshToken = await new SignJWT({
    sub: customerId,
    email,
    shopifyAccessToken, // Store Shopify token in refresh token only
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setNotBefore(now)
    .setJti(crypto.randomUUID())
    .sign(getRefreshTokenSecret());

  return { accessToken, refreshToken };
}

/**
 * Verify and decode access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getAccessTokenSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload as TokenPayload;
  } catch (error) {
    console.error('Access token verification failed:', error);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify and decode refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getRefreshTokenSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload as TokenPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Get access token from Authorization header
 */
export function getAccessTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken');
  return refreshToken?.value || null;
}

/**
 * Set refresh token cookie with secure settings
 */
export function setRefreshTokenCookie(refreshToken: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

  // Create secure cookie string
  const cookieOptions = [
    `refreshToken=${refreshToken}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
  ];

  // Add Secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(): string[] {
  const cookies = [];

  // Clear refresh token
  cookies.push(
    `refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  );

  // Clear legacy customer token if exists
  cookies.push(
    `customer_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  );

  return cookies;
}

/**
 * Validate token payload
 */
export function isTokenExpired(payload: TokenPayload): boolean {
  if (!payload.exp) {
    return true;
  }
  const now = Date.now() / 1000;
  return payload.exp < now;
}

/**
 * Extract customer info from token
 */
export function extractCustomerInfo(payload: TokenPayload) {
  return {
    id: payload.sub,
    email: payload.email,
    shopifyAccessToken: payload.shopifyAccessToken,
  };
}