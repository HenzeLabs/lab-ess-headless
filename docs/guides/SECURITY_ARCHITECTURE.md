# Security Architecture Documentation

## Overview

This document outlines the comprehensive security implementation for the Next.js headless Shopify storefront, featuring Redis-based distributed rate limiting and GDPR-compliant cookie consent management.

## 🔒 Architecture Components

### 1. Redis-Based Distributed Rate Limiter

**Location**: `src/lib/security/middleware.ts`

**Features**:

- **Sliding Window Algorithm**: More accurate rate limiting than fixed windows
- **Burst Protection**: Separate limits for sudden traffic spikes
- **Distributed**: Works across multiple server instances
- **Fallback**: Graceful degradation if Redis is unavailable
- **Multiple Endpoints**: Different limits for different API routes

**Implementation**:

```typescript
// Example usage
const limiter = new RedisRateLimiter(60000, 100, 'api'); // 100 requests per minute
const result = await limiter.slidingWindow('user-ip-address');

if (!result.allowed) {
  return new NextResponse(/* rate limit response */);
}
```

**Rate Limits**:

- API endpoints: 60 requests/minute
- Authentication: 5 requests/15 minutes
- Cart operations: 30 requests/minute
- Admin endpoints: 10 requests/minute
- Search endpoints: 100 requests/minute

### 2. GDPR Cookie Consent System

**Location**: `src/components/CookieConsent.tsx`

**Features**:

- **GDPR Compliant**: Full control over cookie categories
- **Analytics Blocking**: Scripts only load after consent
- **Persistent Storage**: Remembers preferences for 1 year
- **Granular Control**: Separate consent for different cookie types
- **Responsive Design**: Works on all device sizes

**Cookie Categories**:

- **Necessary**: Always enabled, essential functionality
- **Analytics**: Google Analytics, Microsoft Clarity
- **Marketing**: Advertising and tracking
- **Functional**: Chat widgets, personalization

### 3. Privacy-Compliant Analytics

**Location**: `src/components/PrivacyCompliantAnalytics.tsx`

**Features**:

- **Conditional Loading**: Scripts only load with consent
- **Enhanced Privacy**: IP anonymization, consent management
- **Real-time Consent**: Updates when preferences change
- **Comprehensive Tracking**: Ecommerce, performance, custom events
- **Server-Safe**: Functions work server-side without errors

## 🛠️ Configuration

### Environment Variables

```bash
# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-id

# Security Configuration
ADMIN_TOKEN=your-secure-admin-token
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5
RATE_LIMIT_CART_MAX_REQUESTS=30
RATE_LIMIT_ADMIN_MAX_REQUESTS=10

# GDPR Compliance
COOKIE_CONSENT_VERSION=1
PRIVACY_POLICY_URL=/privacy
TERMS_OF_SERVICE_URL=/terms
```

### Security Configuration

**Location**: `src/config/security.ts`

Centralized configuration for:

- Rate limiting rules
- Security headers
- Suspicious activity detection
- Admin access control
- GDPR compliance settings

## 🚀 Implementation Guide

### 1. Install Dependencies

```bash
npm install @upstash/redis
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for Redis rate limiting
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Required for analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-id
```

### 3. Configure Upstash Redis

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token
4. Add to environment variables

**Alternative**: Use traditional Redis with `ioredis`:

```bash
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-password
```

### 4. Update Application Layout

The system is already integrated in `src/app/layout.tsx`:

```tsx
<PrivacyCompliantAnalytics>
  {/* Your app content */}
</PrivacyCompliantAnalytics>
<CookieConsent />
```

## 🔧 API Reference

### Rate Limiter Methods

```typescript
// Basic rate limiting
const result = await limiter.isAllowed(identifier);

// Sliding window (more accurate)
const result = await limiter.slidingWindow(identifier);

// Burst protection
const result = await limiter.burstProtection(
  identifier,
  burstLimit,
  burstWindow,
);
```

### Analytics Functions

```typescript
import { analytics } from '@/components/PrivacyCompliantAnalytics';

// Track purchases
analytics.trackPurchase('order-123', 99.99, 'USD', items);

// Track product views
analytics.trackProductView('product-456', 'Lab Equipment', 'Equipment', 199.99);

// Track custom events
analytics.trackEvent('newsletter_signup', { source: 'homepage' });

// Track page views (for SPAs)
analytics.trackPageView('/products/new-product', 'New Product Page');
```

### Cookie Consent Utilities

```typescript
import {
  hasAnalyticsConsent,
  hasMarketingConsent,
} from '@/components/CookieConsent';

// Check consent status
if (hasAnalyticsConsent()) {
  // Initialize analytics
}

if (hasMarketingConsent()) {
  // Load marketing scripts
}
```

## 🛡️ Security Features

### 1. Request Security

- **IP Detection**: Accurate client IP extraction from various headers
- **Suspicious Activity**: Automatic detection of bots and malicious requests
- **Admin Protection**: Token and IP-based access control
- **Header Validation**: Comprehensive security headers

### 2. Rate Limiting Features

- **Sliding Window**: More accurate than fixed windows
- **Burst Protection**: Prevents sudden traffic spikes
- **Endpoint-Specific**: Different limits for different endpoints
- **Graceful Degradation**: Continues working if Redis fails
- **Monitoring**: Built-in health checks and monitoring

### 3. Privacy Features

- **Cookie Consent**: GDPR-compliant consent management
- **Script Blocking**: Analytics scripts blocked until consent
- **Granular Control**: Separate consent for different purposes
- **Persistent Preferences**: Remembers choices for 1 year
- **Privacy by Design**: Analytics configured for maximum privacy

## 📊 Monitoring & Debugging

### Rate Limiter Monitoring

```typescript
// Check Redis health
const isHealthy = await checkRedisHealth();

// Monitor rate limiter status
await monitorRateLimiters();
```

### Analytics Debugging

In development mode, a debug panel shows:

- Analytics enabled/disabled status
- Marketing consent status
- Script loading status

### Security Headers

The following security headers are automatically applied:

```
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 🔍 Testing & Validation

### 1. Rate Limiting Tests

```bash
# Test API rate limits
curl -I "http://localhost:3000/api/test" # Check headers

# Test multiple requests
for i in {1..10}; do curl "http://localhost:3000/api/test"; done
```

### 2. Cookie Consent Tests

1. Open website in incognito mode
2. Verify cookie banner appears
3. Test "Accept All" and "Reject All"
4. Verify analytics scripts load/don't load accordingly
5. Check localStorage for preferences

### 3. Analytics Tests

```javascript
// In browser console
window.trackEvent('test_event', { test: true });
window.trackPageView('/test-page', 'Test Page');

// Check if functions exist
console.log(typeof window.gtag); // Should be 'function' if analytics enabled
```

## 🚨 Error Handling

### Rate Limiter Fallbacks

1. **Redis Unavailable**: Allows requests (fail-open)
2. **Network Issues**: Logs errors, continues processing
3. **Invalid Configuration**: Uses default values

### Analytics Fallbacks

1. **Consent Not Given**: Scripts don't load, functions are no-ops
2. **Script Loading Fails**: Graceful degradation
3. **Network Issues**: Doesn't block page loading

## 📈 Performance Considerations

### Rate Limiter Performance

- **Redis Pipeline**: Atomic operations for better performance
- **Key Expiration**: Automatic cleanup of old rate limit data
- **Memory Efficient**: Sliding window uses minimal storage

### Analytics Performance

- **Script Strategy**: `afterInteractive` loading
- **Conditional Loading**: Scripts only load when needed
- **Minimal Impact**: No blocking of critical page resources

## 🔧 Customization

### Custom Rate Limits

```typescript
// Add custom rate limiter
const customLimiter = new RedisRateLimiter(
  30000, // 30 seconds
  50, // 50 requests
  'custom', // key prefix
);
```

### Custom Cookie Categories

Extend the cookie consent system by modifying the `CookiePreferences` interface:

```typescript
interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  // Add your custom categories
  social: boolean;
  video: boolean;
}
```

### Custom Analytics Events

```typescript
// Track custom business metrics
analytics.trackEvent('product_comparison', {
  products: ['product1', 'product2'],
  category: 'lab-equipment',
  value: 500,
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Fails**

   - Check environment variables
   - Verify Upstash credentials
   - Check network connectivity

2. **Analytics Not Loading**

   - Verify consent is granted
   - Check environment variables
   - Look for console errors

3. **Rate Limiting Too Strict**
   - Adjust limits in environment variables
   - Check IP detection accuracy
   - Review suspicious request patterns

### Debug Commands

```bash
# Check rate limiter configuration
npm run dev
# Visit http://localhost:3000/api/health-check

# Test middleware
curl -v http://localhost:3000/api/test

# Check Redis connection
# (In browser console)
fetch('/api/redis-health').then(r => r.json())
```

## 📝 Compliance Notes

### GDPR Compliance

- ✅ Clear consent mechanism
- ✅ Granular control over cookie categories
- ✅ Easy withdrawal of consent
- ✅ Data minimization principles
- ✅ Privacy by design

### Security Best Practices

- ✅ Distributed rate limiting
- ✅ Comprehensive security headers
- ✅ Suspicious activity detection
- ✅ Admin access controls
- ✅ Regular security monitoring

## 🔗 Related Files

- `middleware.ts` - Main middleware entry point
- `src/lib/security/middleware.ts` - Rate limiter implementation
- `src/components/CookieConsent.tsx` - GDPR consent system
- `src/components/PrivacyCompliantAnalytics.tsx` - Analytics wrapper
- `src/config/security.ts` - Security configuration
- `.env.example` - Environment variables template

## 📚 Further Reading

- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [GDPR Compliance Guidelines](https://gdpr.eu/)
- [Next.js Middleware Documentation](https://nextjs.org/docs/middleware)
- [Google Analytics Privacy](https://support.google.com/analytics/answer/2838718)
- [Microsoft Clarity Privacy](https://docs.microsoft.com/en-us/clarity/privacy-consent)
