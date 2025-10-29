import { NextRequest } from 'next/server';
import { getConfigNumber } from '@/lib/configStore';

/**
 * Get security configuration from the config store
 * Falls back to environment variables and static defaults
 */
function getSecurityRateLimitConfig() {
  return {
    // Default rate limits
    default: {
      windowMs: getConfigNumber(
        'security.rateLimit.default.windowMs',
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      ),
      maxRequests: getConfigNumber(
        'security.rateLimit.default.maxRequests',
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      ),
    },

    // API endpoint specific limits
    api: {
      windowMs: getConfigNumber('security.rateLimit.api.windowMs', 60000),
      maxRequests: getConfigNumber('security.rateLimit.api.maxRequests', 60),
    },

    auth: {
      windowMs: getConfigNumber(
        'security.rateLimit.auth.windowMs',
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      ),
      maxRequests: getConfigNumber(
        'security.rateLimit.auth.maxRequests',
        parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '5', 10),
      ),
    },

    cart: {
      windowMs: getConfigNumber('security.rateLimit.cart.windowMs', 60000),
      maxRequests: getConfigNumber(
        'security.rateLimit.cart.maxRequests',
        parseInt(process.env.RATE_LIMIT_CART_MAX_REQUESTS || '30', 10),
      ),
    },

    admin: {
      windowMs: getConfigNumber('security.rateLimit.admin.windowMs', 60000),
      maxRequests: getConfigNumber(
        'security.rateLimit.admin.maxRequests',
        parseInt(process.env.RATE_LIMIT_ADMIN_MAX_REQUESTS || '10', 10),
      ),
    },

    search: {
      windowMs: getConfigNumber('security.rateLimit.search.windowMs', 60000),
      maxRequests: getConfigNumber(
        'security.rateLimit.search.maxRequests',
        100,
      ),
    },

    // Burst protection settings
    burst: {
      limit: 10,
      windowMs: 10000, // 10 seconds
    },
  };
}

// Security configuration for the application
export const securityConfig = {
  rateLimit: getSecurityRateLimitConfig(),

  // Redis configuration
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,

    // Fallback to traditional Redis if Upstash not available
    fallback: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
  },

  // Security headers
  headers: {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enforce HTTPS (adjust max-age as needed)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=()',

    // Content Security Policy (adjust for your needs)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://cdn.shopify.com https://www.google-analytics.com",
      "connect-src 'self' https://api.shopify.com https://www.google-analytics.com https://region1.google-analytics.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },

  // Suspicious activity detection
  suspiciousPatterns: {
    userAgents: [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /php/i,
      /scanner/i,
      /nikto/i,
      /sqlmap/i,
      /nmap/i,
    ],

    referrers: [
      /malware/i,
      /virus/i,
      /hack/i,
      /attack/i,
      /exploit/i,
      /injection/i,
    ],

    paths: [
      /\/wp-admin/i,
      /\/admin/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /\/config/i,
      /\/backup/i,
      /\/database/i,
    ],
  },

  // Admin security
  admin: {
    token: process.env.ADMIN_TOKEN,
    allowedIPs: [
      '127.0.0.1',
      '::1',
      // Add your admin IP addresses here
    ],

    requireToken: true,
    requireIP: false, // Set to true for IP-based access control
  },

  // GDPR compliance
  gdpr: {
    cookieConsentVersion: process.env.COOKIE_CONSENT_VERSION || '1',
    privacyPolicyUrl: process.env.PRIVACY_POLICY_URL || '/privacy',
    termsOfServiceUrl: process.env.TERMS_OF_SERVICE_URL || '/terms',

    // Cookie categories
    cookieCategories: {
      necessary: {
        required: true,
        description: 'Essential for the website to function properly',
      },
      analytics: {
        required: false,
        description:
          'Help us understand how visitors interact with our website',
      },
      marketing: {
        required: false,
        description: 'Used to track visitors across websites for advertising',
      },
      functional: {
        required: false,
        description: 'Enable enhanced functionality like chat widgets',
      },
    },
  },

  // Analytics configuration
  analytics: {
    googleAnalytics: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      privacyConfig: {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
        consent: 'default',
        wait_for_update: 500,
      },
    },

    clarity: {
      projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    },
  },
};

// Helper functions
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP.trim();
  }

  if (remoteAddr) {
    return remoteAddr.trim();
  }

  return '127.0.0.1';
}

export function isAdminRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return pathname.startsWith('/api/admin') || pathname.startsWith('/admin');
}

export function isSuspiciousRequest(request: NextRequest): {
  suspicious: boolean;
  reason?: string;
} {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const { pathname } = request.nextUrl;

  // Check user agent
  for (const pattern of securityConfig.suspiciousPatterns.userAgents) {
    if (pattern.test(userAgent)) {
      return {
        suspicious: true,
        reason: `Suspicious user agent: ${userAgent}`,
      };
    }
  }

  // Check referer
  for (const pattern of securityConfig.suspiciousPatterns.referrers) {
    if (pattern.test(referer)) {
      return { suspicious: true, reason: `Suspicious referer: ${referer}` };
    }
  }

  // Check path
  for (const pattern of securityConfig.suspiciousPatterns.paths) {
    if (pattern.test(pathname)) {
      return { suspicious: true, reason: `Suspicious path: ${pathname}` };
    }
  }

  return { suspicious: false };
}

export function validateAdminAccess(request: NextRequest): {
  allowed: boolean;
  reason?: string;
} {
  const { admin } = securityConfig;
  const clientIP = getClientIP(request);
  const adminToken = request.headers.get('x-admin-token');

  // Check token if required
  if (admin.requireToken && (!adminToken || adminToken !== admin.token)) {
    return { allowed: false, reason: 'Invalid or missing admin token' };
  }

  // Check IP if required
  if (admin.requireIP && !admin.allowedIPs.includes(clientIP)) {
    return { allowed: false, reason: `IP address ${clientIP} not allowed` };
  }

  return { allowed: true };
}

// Rate limit key generators
export function generateRateLimitKey(
  prefix: string,
  identifier: string,
  window?: number,
): string {
  const timestamp = window ? Math.floor(Date.now() / window) : '';
  return `${prefix}:${identifier}${timestamp ? `:${timestamp}` : ''}`;
}

export function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/admin')) {
    return securityConfig.rateLimit.admin;
  }

  if (pathname.startsWith('/api/auth') || pathname.includes('login')) {
    return securityConfig.rateLimit.auth;
  }

  if (pathname.startsWith('/api/cart')) {
    return securityConfig.rateLimit.cart;
  }

  if (pathname.startsWith('/api/search') || pathname.includes('search')) {
    return securityConfig.rateLimit.search;
  }

  if (pathname.startsWith('/api/')) {
    return securityConfig.rateLimit.api;
  }

  return securityConfig.rateLimit.default;
}

export default securityConfig;
