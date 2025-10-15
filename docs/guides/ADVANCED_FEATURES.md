# Advanced Features Guide

This document tracks the status and usage of advanced, optional features in the application.

## Redis Caching

**Status:** Not Implemented

**Details:** Environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) are defined in `.env.example` but are not currently used anywhere in the codebase.

**Action:** A decision is needed to either implement a caching strategy using these variables or remove them.

**Implementation Notes:**
- A Redis client wrapper exists at `src/lib/cache/redis.ts` but is not imported or used
- The wrapper includes connection pooling, retry logic, and TTL management
- Potential use cases: session caching, API response caching, rate limiting

**To Implement:**
1. Install the `redis` npm package: `npm install redis`
2. Configure environment variables in `.env.local`
3. Import and use the Redis client in API routes or server components
4. Add error handling and fallback logic for Redis failures

**To Remove:**
1. Delete `src/lib/cache/redis.ts`
2. Remove `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from `.env.example`

---

## Shopify Admin API

**Status:** Not Implemented

**Details:** Environment variables for the Admin API (`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_ADMIN_ACCESS_TOKEN`) are documented but there are no calls to the Admin API in the current codebase.

**Action:** A decision is needed to either build out admin features or remove the variables.

**Potential Use Cases:**
- Order management (create, update, cancel orders)
- Inventory management (update stock levels)
- Customer management (create accounts, manage addresses)
- Product management (create/update products, manage collections)
- Analytics and reporting (fetch order data, sales reports)

**Implementation Notes:**
- The Storefront API (currently used) is read-only for public product/collection data
- The Admin API provides full CRUD operations and requires private app credentials
- Admin API requests should be made server-side only (never expose credentials to client)

**To Implement:**
1. Create a private app in Shopify Admin
2. Configure API scopes based on required permissions
3. Add credentials to `.env.local`
4. Create server-side utilities in `src/lib/shopify/admin.ts`
5. Add API routes for admin operations (with proper authentication)

**To Remove:**
1. Remove `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, and `SHOPIFY_ADMIN_ACCESS_TOKEN` from `.env.example`

---

## Google Analytics 4 (GA4)

**Status:** Partially Implemented

**Details:**
- GA4 tracking is configured with measurement ID in Next.js config
- Client-side tracking via gtag is implemented
- Enhanced analytics with custom events exists in `src/lib/analytics-tracking-enhanced.ts`
- Server-side tracking with service account is partially configured but not fully utilized

**Current Implementation:**
- ✅ Page views tracked automatically
- ✅ E-commerce events (product views, add to cart, purchases)
- ✅ Custom conversion events
- ✅ User engagement metrics
- ⚠️ Server-side API integration configured but incomplete

**Environment Variables:**
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON (optional, for server-side API access)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - GA4 Measurement ID (configured in `next.config.mjs`)

**Files:**
- `src/lib/analytics-tracking.ts` - Core client-side tracking
- `src/lib/analytics-tracking-enhanced.ts` - Enhanced events and custom dimensions
- `src/lib/ga4-real-data.ts` - Server-side GA4 Data API integration (partial)

**To Fully Implement Server-Side Tracking:**
1. Create a service account in Google Cloud Console
2. Enable GA4 Data API and grant permissions
3. Download service account JSON and add to project root (do not commit!)
4. Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local`
5. Complete the implementation in `src/lib/ga4-real-data.ts`
6. Add server-side event tracking in API routes

**To Remove Server-Side Features:**
1. Delete `src/lib/ga4-real-data.ts`
2. Delete `ga4-service-account.json` if it exists
3. Remove `GOOGLE_APPLICATION_CREDENTIALS` from `.env.example`
4. Keep client-side tracking (recommended for most use cases)

---

## Progressive Web App (PWA)

**Status:** ✅ Implemented

**Details:** The application is configured as a Progressive Web App (PWA) via `next.config.mjs`. This includes a service worker and an offline fallback page.

**Current Implementation:**
- ✅ Web App Manifest (`public/manifest.json`)
- ✅ Service Worker (`public/sw.js`)
- ✅ Offline fallback page (`src/app/offline/page.tsx`)
- ✅ App icons (SVG and PNG formats in various sizes)
- ✅ Installable on mobile and desktop devices
- ✅ Offline support with cached assets
- ✅ Background sync capabilities

**Files:**
- `public/manifest.json` - PWA manifest with app metadata, icons, theme colors
- `public/sw.js` - Service worker with caching strategies and offline support
- `public/workbox-*.js` - Workbox runtime for advanced caching
- `public/icon-*.svg` / `public/icon-*.png` - App icons in multiple sizes
- `src/app/offline/page.tsx` - Fallback page shown when offline
- `next.config.mjs` - PWA configuration and service worker registration

**Features:**
- **Install Prompt:** Users can install the app on their device
- **Offline Mode:** Core pages and assets cached for offline access
- **Background Sync:** Queue API requests when offline, sync when online
- **Push Notifications:** Infrastructure ready (not yet implemented)
- **App-like Experience:** Runs in standalone mode without browser UI

**Configuration:**
```json
// public/manifest.json
{
  "name": "Lab Essentials Headless",
  "short_name": "Lab Ess",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

**Testing PWA:**
1. Build production version: `npm run build && npm start`
2. Open Chrome DevTools > Application > Manifest
3. Check "Service Workers" and "Offline" in Application tab
4. Test offline mode by throttling network in DevTools
5. Use Lighthouse PWA audit: `npm run lh`

**Maintenance:**
- Service worker cache should be versioned and updated on deployments
- Test offline functionality after major changes
- Keep manifest.json metadata up to date
- Optimize icon assets for fast loading

---

## A/B Testing Framework

**Status:** ✅ Implemented & Secured

**Details:** A full A/B testing framework exists with API routes at `/api/experiments` and `/api/ab-tests`. As of the latest security hardening, these routes are now protected with admin authentication.

**Current Implementation:**
- ✅ Experiment configuration and variant management
- ✅ Feature flag system for gradual rollouts
- ✅ User assignment and tracking
- ✅ Analytics integration for conversion tracking
- ✅ Admin authentication required for mutations
- ✅ Built-in experiments and feature flags

**Files:**
- `src/lib/experiments/types.ts` - Type definitions for experiments and feature flags
- `src/lib/experiments/manager.ts` - Core experiment management logic
- `src/components/optimization/ABTestingFramework.tsx` - React hooks and client-side integration
- `src/app/api/experiments/route.ts` - API endpoints for experiment CRUD operations (secured)
- `src/app/api/ab-tests/[testId]/route.ts` - API endpoints for individual test management (secured)

**Security:**
- ✅ Admin authentication required for all mutations (POST, PUT, DELETE)
- ✅ Configured via `ADMIN_EMAILS` environment variable
- ✅ JWT-based authentication with token verification
- ✅ GET requests remain public for reading experiment configurations

**Usage Example:**
```typescript
import { useABTest } from '@/components/optimization/ABTestingFramework';

function MyComponent() {
  const { variant, trackEvent } = useABTest('checkout-button-color');

  return (
    <button
      className={variant === 'A' ? 'bg-blue-500' : 'bg-green-500'}
      onClick={() => trackEvent('clicked')}
    >
      Checkout
    </button>
  );
}
```

**API Endpoints:**

**GET /api/experiments**
- Query params: `?type=experiments|feature-flags|assignments|events`
- Returns experiment data (public)

**POST /api/experiments**
- Requires: Admin authentication
- Actions: `create-experiment`, `update-experiment`, `create-flag`, `update-flag`, `track-event`
- Body: Configuration object

**DELETE /api/experiments**
- Requires: Admin authentication
- Query params: `?type=experiment|reset&id={id}`
- Deletes experiment or resets all data

**GET /api/ab-tests/[testId]**
- Returns specific test configuration (public)

**POST /api/ab-tests/[testId]**
- Requires: Admin authentication
- Body: Test configuration
- Creates or updates test

**Configuration Required:**
```bash
# .env.local
ADMIN_EMAILS=admin@example.com,dev@example.com
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

**Built-in Experiments:**
The framework includes pre-configured experiments in `src/lib/experiments/types.ts`:
- Checkout flow optimization
- Product page layout variations
- Search algorithm improvements
- Pricing display experiments

**Best Practices:**
1. Always define hypothesis and success metrics before creating experiments
2. Use feature flags for gradual rollouts of new features
3. Monitor experiment performance with analytics integration
4. Archive completed experiments after analysis
5. Document learnings from each experiment

**Testing:**
```bash
# Create an experiment (requires admin auth)
curl -X POST http://localhost:3000/api/experiments?action=create-experiment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-exp","name":"Test","variants":[...]}'

# Get all experiments (public)
curl http://localhost:3000/api/experiments?type=experiments
```

---

## Summary

| Feature | Status | Action Required |
|---------|--------|-----------------|
| Redis Caching | ❌ Not Implemented | Implement or remove |
| Shopify Admin API | ❌ Not Implemented | Implement or remove |
| Google Analytics 4 | ⚠️ Partial | Complete server-side or keep client-side only |
| PWA | ✅ Implemented | Maintain and test regularly |
| A/B Testing | ✅ Implemented & Secured | Ready for production use |

## Recommendations

1. **Redis Caching:** Consider implementing for improved performance, especially for:
   - Shopify API response caching (reduce API calls)
   - Session storage (faster than database queries)
   - Rate limiting (prevent abuse)

2. **Shopify Admin API:** Only implement if admin features are needed:
   - Order management dashboard
   - Inventory updates
   - Custom reporting
   - Otherwise, remove to reduce complexity

3. **GA4 Server-Side:**
   - Keep client-side tracking (currently working well)
   - Only add server-side if you need: server-to-server conversions, enhanced measurement, or data import
   - Server-side adds complexity and maintenance overhead

4. **PWA:**
   - Currently working well
   - Test offline functionality regularly
   - Keep service worker cache updated on deployments

5. **A/B Testing:**
   - Now production-ready with authentication
   - Document all experiments in a central location
   - Set up analytics dashboards for experiment tracking
   - Define a process for experiment lifecycle (create → run → analyze → archive)
