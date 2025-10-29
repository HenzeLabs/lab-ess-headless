# Deployment Audit System

Comprehensive deployment readiness validation for the Lab Essentials headless Shopify storefront. This system implements strict quality gates that must pass before any production deployment.

## Overview

This deployment audit system is based on production-grade standards for e-commerce sites and ensures:

- **Zero tolerance** for critical failures (tests, security, accessibility)
- **Performance standards** that meet Google's Core Web Vitals thresholds
- **SEO optimization** for maximum discoverability
- **Security hardening** against common vulnerabilities
- **Comprehensive testing** across devices and browsers

## Quick Start

### Run Full Pre-Deployment Checklist

```bash
# Full audit (recommended before deployment)
npm run pre-deploy

# Quick mode (skip slow checks like Lighthouse)
npm run pre-deploy:quick

# Test staging environment
npm run pre-deploy:staging -- --staging-url=https://staging.labessentials.com
```

### Run Individual Audits

```bash
# Security audit
npm run audit:security

# SEO validation
npm run audit:seo

# Bundle size check
npm run audit:bundle

# Link checker
npm run test:links

# Full deployment audit
npm run audit:deployment
```

## Hard Gates (Fail = No Deploy)

These gates **MUST** pass for deployment to proceed. Any failure blocks deployment.

### 1. Tests (100% Pass Rate)

```bash
npm run test:all
```

**Requirements:**
- 100% passing tests (unit/integration/E2E)
- Zero flaky tests allowed
- All critical user flows validated

**Covers:**
- Homepage, product pages, collections
- Cart and checkout flows
- Search functionality
- Mobile navigation
- Authentication (if applicable)

### 2. Lighthouse Performance & Quality

```bash
npm run lh
```

**Requirements (Mobile):**
- Performance: ≥ 90
- SEO: ≥ 95
- Best Practices: ≥ 95
- PWA: ≥ 95
- Accessibility: ≥ 95

**Conditions:**
- Tested on 3G Fast network
- 4X CPU slowdown
- Mobile device emulation

### 3. Core Web Vitals (p75)

**Requirements (Mobile):**
- LCP (Largest Contentful Paint): ≤ 2.5s
- INP (Interaction to Next Paint): ≤ 200ms
- CLS (Cumulative Layout Shift): ≤ 0.1

**Monitoring:**
- Real User Monitoring (RUM) via web-vitals
- BigQuery/GA4 tracking
- 24/7 alerting on threshold breaches

### 4. Console Errors

**Requirements:**
- Zero console errors during test runs
- Warnings allowed but should be minimized

### 5. Links & 404s

```bash
npm run test:links
```

**Requirements:**
- Zero broken internal links
- Zero 404 errors (except intentional, e.g., `/404` test page)
- External links accessible

### 6. Accessibility

```bash
npm run test:a11y
```

**Requirements:**
- axe-core: Zero critical issues
- WCAG 2.1 AA: Zero blockers
- Keyboard navigation fully functional
- Screen reader compatibility

**Checks:**
- Semantic HTML and ARIA
- Color contrast ≥ 4.5:1
- Focus management
- Alt text for images
- Form labels and error messages

### 7. Security

```bash
npm run audit:security
```

**Requirements:**
- No secrets in repository
- CSP (Content Security Policy) enabled
- SRI (Subresource Integrity) for external scripts
- HTTPS only
- Zero high/critical npm vulnerabilities

**Checks:**
- Secret scanning in git history
- npm audit for vulnerabilities
- Security headers validation
- Environment variable security
- HTTPS/HSTS configuration

### 8. Bundle Size

```bash
npm run audit:bundle
```

**Requirements:**
- JavaScript: ≤ 220 KB
- Third-party JS: ≤ 150 KB
- CSS: ≤ 50 KB
- Fonts: ≤ 100 KB

## Architecture & Data

### Shopify Storefront API

- **Query batching**: Combine multiple queries to reduce round trips
- **Fragments**: Reuse query fragments for consistency
- **ETags**: Implement caching with ETags for unchanged data
- **Avoid N+1**: Batch product queries, avoid individual requests

### Cache Strategy

```typescript
// ISR/SSG for static content
export const revalidate = 3600; // 1 hour

// Edge caching via CDN
headers: {
  'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=59'
}

// SWR for client-side data
useSWR(key, fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
});
```

### Cart/Checkout

- **Consistency**: Atomic cart mutations
- **Draft orders**: Handle complex scenarios
- **Recovery**: Persist cart state in localStorage
- **Handoff**: Seamless transition to Shopify checkout

### Webhooks/Queues

- **Idempotency keys**: Prevent duplicate processing
- **Retries**: Exponential backoff for failures
- **Dead-letter queue**: Capture failed webhooks

## Performance Optimization

### Code Splitting

```typescript
// Route-based splitting (automatic with Next.js)
const ProductPage = dynamic(() => import('./ProductPage'));

// Component-based splitting
const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
  loading: () => <ReviewsSkeleton />,
  ssr: false, // Client-only if not needed for SEO
});
```

### Image Pipeline

```tsx
<Image
  src={product.image}
  alt={product.title}
  width={800}
  height={800}
  formats={['image/avif', 'image/webp']}
  loading={isAboveFold ? 'eager' : 'lazy'}
  priority={isAboveFold}
/>
```

**Best practices:**
- WebP/AVIF formats
- Responsive sizing with `deviceSizes`
- DPR (Device Pixel Ratio) optimization
- Lazy loading for below-fold images
- Priority loading for hero images

### Font Loading

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Prevent FOIT */
  font-weight: 400;
  font-style: normal;
}
```

**Configuration:**
- `font-display: swap` to prevent invisible text
- Preconnect to font CDN
- Subset fonts to reduce size
- WOFF2 format for maximum compression

### Third-Party Budget

```typescript
// deployment-gates.config.json
{
  "performanceBudgets": {
    "bundle": {
      "maxThirdPartyKb": 150
    }
  }
}
```

**Strategy:**
- Defer non-critical scripts
- Load behind consent management
- Self-host critical third-party scripts
- Use facade pattern for heavy embeds

## SEO & Content

### Meta Tags

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://store.labessentials.com'),
  title: {
    default: 'Lab Essentials',
    template: '%s | Lab Essentials',
  },
  description: 'Professional laboratory equipment and supplies',
  openGraph: {
    title: 'Lab Essentials',
    description: 'Professional laboratory equipment',
    url: 'https://store.labessentials.com',
    siteName: 'Lab Essentials',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lab Essentials',
    description: 'Professional laboratory equipment',
    images: ['/twitter-image.jpg'],
  },
};
```

**Requirements:**
- Title: ≤ 60 characters
- Description: ≤ 155 characters
- Unique per page
- Include target keywords

### Structured Data

```typescript
// Product page structured data
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  image: product.images,
  sku: product.sku,
  brand: { '@type': 'Brand', name: 'Lab Essentials' },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'USD',
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  },
};
```

**Required schemas:**
- Organization
- WebSite
- Product (on product pages)
- BreadcrumbList
- FAQPage (if applicable)

### Sitemap & Robots

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const collections = await getCollections();

  return [
    { url: '/', lastModified: new Date(), priority: 1 },
    ...products.map((p) => ({
      url: `/products/${p.handle}`,
      lastModified: p.updatedAt,
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `/collections/${c.handle}`,
      lastModified: c.updatedAt,
      priority: 0.6,
    })),
  ];
}
```

## Accessibility Standards

### Semantic Landmarks

```tsx
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</header>

<main role="main">
  {/* Main content */}
</main>

<footer role="contentinfo">
  {/* Footer content */}
</footer>
```

### Keyboard Navigation

```typescript
// Custom focus trap for modals
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input, select'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
};
```

### Skip-to-Content

```tsx
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>
```

## Security & Privacy

### Content Security Policy

Located in [next.config.mjs](next.config.mjs#L118-L131):

```javascript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted-domains.com",
  "connect-src 'self' https://api-domains.com",
  "img-src 'self' data: https: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-src 'self' https://checkout.shopify.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.shopify.com",
  "frame-ancestors 'none'",
].join('; ')
```

**Best practices:**
- Remove `'unsafe-inline'` and `'unsafe-eval'` where possible
- Use nonces or hashes for inline scripts
- Whitelist only necessary domains
- Review CSP regularly

### Environment Variables

```bash
# .env.example (checked in)
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=

# .env (gitignored, never commit)
# Contains actual secrets
```

**Security:**
- Never commit `.env` files
- Use secrets management (Vercel, AWS Secrets Manager)
- Rotate tokens regularly
- Audit API scopes quarterly

## Analytics & Tracking

### GA4 E-commerce Events

```typescript
// Track purchase
gtag('event', 'purchase', {
  transaction_id: order.id,
  value: order.total,
  currency: 'USD',
  items: order.items.map((item) => ({
    item_id: item.id,
    item_name: item.title,
    price: item.price,
    quantity: item.quantity,
  })),
});
```

**Required events:**
- `view_item` - Product page views
- `add_to_cart` - Add to cart
- `begin_checkout` - Checkout started
- `purchase` - Order completed

### Server-Side Tracking

```typescript
// Server-side event tracking
await fetch('https://www.google-analytics.com/mp/collect', {
  method: 'POST',
  body: JSON.stringify({
    client_id: userId,
    events: [
      {
        name: 'purchase',
        params: { /* ... */ },
      },
    ],
  }),
});
```

**Benefits:**
- Ad blocker resistant
- More accurate conversion tracking
- First-party data collection

## Test Matrix

### Devices

- iPhone 12 (iOS 15+)
- iPhone 14 (iOS 16+)
- iPhone SE (smaller screen)
- Pixel 5 (Android 11+)
- Pixel 7 (Android 13+)
- iPad (tablet)
- Low-end Android device

### Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Safari (previous version)
- Edge (latest)

### Network Conditions

- 3G Fast (Lighthouse default)
- 4G
- Offline (PWA fallback)

## CI/CD Integration

### GitHub Actions Workflow

Located at [.github/workflows/deployment-gates.yml](.github/workflows/deployment-gates.yml)

**Jobs:**
1. Code Quality (TypeScript, ESLint, Brand tokens)
2. Security Audit (Secret scan, npm audit, headers)
3. Build & Bundle Analysis
4. Core Functional Tests
5. Accessibility Tests
6. Lighthouse Performance Audit
7. SEO Validation
8. Final Deployment Check

**Triggers:**
- Push to `main` or `staging`
- Pull request to `main`
- Manual workflow dispatch

### Required Secrets

```yaml
# .github/secrets
SHOPIFY_STORE_DOMAIN: store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN: shpat_xxxxx
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: store.labessentials.com
LHCI_GITHUB_APP_TOKEN: (optional, for Lighthouse CI)
```

## Pre-Launch Checklist

### 1 Week Before Launch

- [ ] Run full audit: `npm run pre-deploy`
- [ ] Review and fix all critical failures
- [ ] Address warnings and technical debt
- [ ] Update documentation
- [ ] Train team on rollback procedures

### 1 Day Before Launch

- [ ] Freeze content changes
- [ ] Run full test suite: `npm run test:all`
- [ ] Verify staging matches production config
- [ ] Warm CDN cache
- [ ] Prepare 301 redirects (if migrating)

### Launch Day

- [ ] Enable HSTS header
- [ ] Monitor error rate (target: < 0.1%)
- [ ] Monitor Core Web Vitals
- [ ] Monitor checkout conversion rate
- [ ] Verify revenue parity with Shopify admin
- [ ] Have rollback script ready

### Post-Launch (24h)

- [ ] Review error logs
- [ ] Analyze performance metrics
- [ ] Check conversion rates
- [ ] Validate analytics tracking
- [ ] Document any issues for retrospective

## Rollback Procedures

### Vercel Deployment Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Cloudflare Pages Rollback

1. Go to Cloudflare Dashboard
2. Select Pages project
3. View deployments
4. Click "Rollback" on previous deployment

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Force redeploy
vercel --prod
```

## Monitoring & Alerting

### Error Monitoring

```bash
# Install Sentry
npm install @sentry/nextjs
```

```typescript
// sentry.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Core Web Vitals RUM

```typescript
// app/layout.tsx
import { sendToAnalytics } from './analytics';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  sendToAnalytics(metric);

  // Alert on threshold breaches
  if (metric.name === 'LCP' && metric.value > 2500) {
    console.warn('LCP threshold breached', metric);
  }
}
```

### Uptime Monitoring

- Use UptimeRobot, Pingdom, or similar
- Monitor critical pages:
  - Homepage
  - Product page
  - Collections page
  - Cart
  - Search

## Troubleshooting

### Failed Bundle Size Check

```bash
# Analyze bundle
npm run analyze

# Check for large dependencies
npm ls --depth=0

# Tree-shake unused code
npm run build -- --profile
```

### Failed Accessibility Tests

```bash
# Run accessibility tests
npm run test:a11y

# Generate detailed report
npm run test:a11y -- --reporter=html
```

### Failed Security Audit

```bash
# Run security check
npm run audit:security

# Fix npm vulnerabilities
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [axe-core](https://github.com/dequelabs/axe-core)

## Support

For issues or questions:
1. Check [DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md) (this file)
2. Review [deployment-gates.config.json](./deployment-gates.config.json)
3. Run diagnostics: `npm run audit:deployment`
4. Contact DevOps team

---

**Version:** 1.0.0
**Last Updated:** 2025-10-24
**Maintained by:** Lab Essentials Engineering Team
