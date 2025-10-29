# Continuous Improvement System

Automated tracking and regression prevention for build size, performance, accessibility, and dependencies.

---

## Table of Contents

1. [Overview](#overview)
2. [Lighthouse CI Integration](#lighthouse-ci-integration)
3. [Bundle Size Tracking](#bundle-size-tracking)
4. [Dependency Monitoring](#dependency-monitoring)
5. [Core Web Vitals Monitoring](#core-web-vitals-monitoring)
6. [Test Coverage Expansion](#test-coverage-expansion)
7. [Monthly Review Dashboard](#monthly-review-dashboard)
8. [Alerts and Notifications](#alerts-and-notifications)

---

## Overview

### Goals

- **Prevent Regressions:** Catch performance and bundle size degradation before production
- **Track Trends:** Monitor metrics over time to identify gradual degradation
- **Automate Reviews:** Reduce manual checking with automated baselines and alerts
- **Drive Improvement:** Use data to prioritize optimization work

### Components

1. **Lighthouse CI** - Performance regression detection on every PR
2. **Bundle Analyzer** - Track JavaScript/CSS size trends
3. **Renovate Bot** - Automated dependency updates
4. **Core Web Vitals RUM** - Real user monitoring in production
5. **Expanded Test Suite** - Comprehensive smoke and integration tests
6. **Monthly Dashboard** - Unified view of all metrics

---

## Lighthouse CI Integration

### Setup

Lighthouse CI is configured to run on every pull request and main branch push.

**Configuration File:** [.lighthouserc.json](./.lighthouserc.json)

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/collections",
        "http://localhost:3000/products",
        "http://localhost:3000/cart",
        "http://localhost:3000/search"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

### Workflow

**File:** [.github/workflows/lighthouse-ci.yml](./.github/workflows/lighthouse-ci.yml)

- Runs on: PRs to main, pushes to main/develop, manual trigger
- Builds production bundle
- Runs Lighthouse on 5 critical pages
- Saves baseline on main branch (90-day retention)
- Comments on PRs with score comparison

### Thresholds

| Category | Threshold | Action on Failure |
|----------|-----------|-------------------|
| Performance | ≥90 | Error (blocks merge) |
| Accessibility | ≥95 | Error (blocks merge) |
| Best Practices | ≥95 | Error (blocks merge) |
| SEO | ≥95 | Error (blocks merge) |
| PWA | ≥90 | Warning (review required) |
| LCP | ≤2500ms | Error (blocks merge) |
| CLS | ≤0.1 | Error (blocks merge) |
| TBT | ≤300ms | Error (blocks merge) |

### Usage

```bash
# Run Lighthouse CI locally
npm install -g @lhci/cli
npm run build
npm run start &
lhci autorun

# View results
open .lighthouseci/index.html
```

### Baseline Management

**Main Branch Baselines:**
- Automatically saved on every main branch deployment
- Stored as GitHub Actions artifacts for 90 days
- Filename format: `baseline-YYYYMMDD-HHMMSS.json`

**Comparing Against Baseline:**
```bash
# Download latest baseline from GitHub Actions artifacts
# Compare current scores
lhci assert --preset=lighthouse:recommended
```

---

## Bundle Size Tracking

### Current Implementation

**Script:** [scripts/check-bundle-size.mjs](./scripts/check-bundle-size.mjs)

Tracks:
- Total JavaScript size (budget: 1300 KB)
- Total CSS size (budget: 150 KB)
- Third-party scripts (budget: 200 KB)
- Individual page chunks

### Weekly Tracking

**Workflow:** [.github/workflows/scheduled-governance.yml](./.github/workflows/scheduled-governance.yml)

Runs every Sunday at 2 AM UTC:
```yaml
- name: Track bundle size over time
  run: |
    npm run audit:bundle > bundle-size-$(date +%Y%m%d).txt
    # Artifact uploaded with 90-day retention
```

### Trend Analysis

**Monthly Review Steps:**

1. Download last 4 weekly bundle size reports from GitHub Actions artifacts
2. Compare total JS/CSS sizes
3. Identify growing bundles
4. Create optimization tickets if growth >10%

**Example Trend Chart:**

| Date | JS Size | CSS Size | Total | vs Previous |
|------|---------|----------|-------|-------------|
| 2024-10-06 | 1207 KB | 121 KB | 1328 KB | baseline |
| 2024-10-13 | 1215 KB | 122 KB | 1337 KB | +0.7% |
| 2024-10-20 | 1225 KB | 123 KB | 1348 KB | +1.5% |
| 2024-10-27 | 1240 KB | 125 KB | 1365 KB | +2.8% ⚠️ |

**Action Threshold:** >5% growth month-over-month triggers optimization review.

### Bundle Analyzer

```bash
# Generate interactive bundle visualization
ANALYZE=true npm run build

# Opens bundle analyzer in browser
# Identify largest chunks and dependencies
```

---

## Dependency Monitoring

### Renovate Bot Setup

**Configuration File:** Create `renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:base",
    "schedule:weekly",
    ":dependencyDashboard",
    ":semanticCommits",
    ":separateMajorReleases"
  ],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "matchCurrentVersion": "!/^0/",
      "automerge": true,
      "automergeType": "pr",
      "automergeStrategy": "squash"
    },
    {
      "matchPackageNames": ["next", "react", "react-dom"],
      "groupName": "react ecosystem",
      "schedule": ["before 3am on Monday"]
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "automerge": true
  },
  "prConcurrentLimit": 5,
  "prHourlyLimit": 2
}
```

**Install Renovate:**

1. Install [Renovate GitHub App](https://github.com/apps/renovate)
2. Grant access to repository
3. Add `renovate.json` to root
4. Push to main branch

**Renovate will:**
- Create dependency update PRs weekly
- Auto-merge minor/patch updates after tests pass
- Group related updates (e.g., React ecosystem)
- Alert on security vulnerabilities
- Create dependency dashboard issue

### Security Monitoring

**GitHub Dependabot:**
- Already configured in repository settings
- Creates PRs for security vulnerabilities
- Checks daily for new CVEs

**npm audit:**
```bash
# Run manually
npm audit

# Run in CI (scheduled-governance.yml)
npm audit --production --audit-level=high
```

**Weekly Security Report:**

Automated by scheduled-governance workflow:
```yaml
- name: Dependency security audit
  run: |
    npm audit --production --audit-level=high | tee audit-report.txt
    # Uploads as artifact with 30-day retention
```

---

## Core Web Vitals Monitoring

### Real User Monitoring (RUM)

**Setup Options:**

#### Option 1: Vercel Analytics (Built-in)

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Dashboard:** https://vercel.com/[your-org]/[project]/analytics

Tracks:
- LCP (Largest Contentful Paint)
- FID (First Input Delay) / INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

#### Option 2: Google Analytics 4 (Already Configured)

Web Vitals automatically reported to GA4:
- Custom events: `web_vitals`
- Dimensions: `metric_name`, `metric_value`, `metric_rating`

**View in GA4:**
1. Navigate to Reports → Engagement → Events
2. Filter by `web_vitals` event
3. Add secondary dimension: `metric_name`
4. Export to Google Sheets for trending

#### Option 3: SpeedCurve (Advanced)

**Setup:**
1. Sign up at [speedcurve.com](https://www.speedcurve.com/)
2. Install RUM snippet
3. Configure alerts

**Features:**
- Historical Core Web Vitals trends
- Performance budgets with alerts
- Competitive benchmarking
- Custom dashboards

### Baseline Capture (24h Post-Launch)

**Script:** Create `scripts/capture-cwv-baseline.mjs`:

```javascript
#!/usr/bin/env node

import https from 'https';
import fs from 'fs';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://store.labessentials.com';

console.log('🔍 Capturing Core Web Vitals baseline...\n');
console.log(`URL: ${PRODUCTION_URL}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

// Use Chrome UX Report API
const fetchCruxData = async (url) => {
  // Requires API key: https://developers.google.com/speed/docs/insights/v5/get-started
  const apiKey = process.env.GOOGLE_PSI_API_KEY;

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile`;

  return new Promise((resolve, reject) => {
    https.get(apiUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const captureBaseline = async () => {
  try {
    const data = await fetchCruxData(PRODUCTION_URL);

    const cwv = {
      timestamp: new Date().toISOString(),
      url: PRODUCTION_URL,
      metrics: {
        lcp: data.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
        fid: data.loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.percentile,
        cls: data.loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile,
        ttfb: data.loadingExperience?.metrics?.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile,
      },
      lighthouse: {
        performance: data.lighthouseResult?.categories?.performance?.score * 100,
        accessibility: data.lighthouseResult?.categories?.accessibility?.score * 100,
        bestPractices: data.lighthouseResult?.categories?.['best-practices']?.score * 100,
        seo: data.lighthouseResult?.categories?.seo?.score * 100,
      }
    };

    const filename = `cwv-baseline-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(cwv, null, 2));

    console.log('✅ Baseline captured successfully!\n');
    console.log(`📄 Saved to: ${filename}\n`);
    console.log('Core Web Vitals:');
    console.log(`  LCP: ${cwv.metrics.lcp}ms`);
    console.log(`  FID: ${cwv.metrics.fid}ms`);
    console.log(`  CLS: ${cwv.metrics.cls}`);
    console.log(`  TTFB: ${cwv.metrics.ttfb}ms\n`);
    console.log('Lighthouse Scores:');
    console.log(`  Performance: ${cwv.lighthouse.performance}`);
    console.log(`  Accessibility: ${cwv.lighthouse.accessibility}`);
    console.log(`  Best Practices: ${cwv.lighthouse.bestPractices}`);
    console.log(`  SEO: ${cwv.lighthouse.seo}\n`);

  } catch (error) {
    console.error('❌ Failed to capture baseline:', error.message);
    process.exit(1);
  }
};

captureBaseline();
```

**Usage:**
```bash
# 24 hours after production launch
GOOGLE_PSI_API_KEY=your-api-key \
PRODUCTION_URL=https://store.labessentials.com \
node scripts/capture-cwv-baseline.mjs

# Store baseline in repository
git add cwv-baseline-*.json
git commit -m "chore: capture CWV baseline 24h post-launch"
git push
```

---

## Test Coverage Expansion

### Current Coverage

**Smoke Tests:** [tests/post-deploy-smoke.spec.ts](./tests/post-deploy-smoke.spec.ts)
- 17 test cases covering critical paths
- Homepage, collections, products, cart, search
- Analytics, performance, SEO, mobile

### Expansion Roadmap

#### Phase 1: E2E Checkout Flow (High Priority)

**File:** `tests/checkout-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Checkout Flow', () => {
  test('should complete full purchase journey', async ({ page }) => {
    // 1. Browse products
    await page.goto('/collections');
    await page.click('a[href*="/products/"]:first-child');

    // 2. Add to cart
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('[data-cart-count]')).toHaveText('1');

    // 3. View cart
    await page.goto('/cart');
    await expect(page.locator('[data-cart-item]')).toBeVisible();

    // 4. Proceed to checkout
    await page.click('a:has-text("Checkout")');

    // 5. Verify redirect to Shopify checkout
    await expect(page).toHaveURL(/checkout\.shopify\.com/);

    // 6. Verify cart data passed correctly
    // (Requires test Shopify store credentials)
  });
});
```

#### Phase 2: Quiz Flow Validation

**File:** `tests/quiz-flow.spec.ts`

```typescript
test.describe('Microscope Selection Quiz', () => {
  test('should complete quiz and show recommendations', async ({ page }) => {
    await page.goto('/quiz');

    // Answer all questions
    await page.click('[data-answer="professional"]');
    await page.click('button:has-text("Next")');
    // ... continue through all questions

    // Verify recommendations shown
    await expect(page.locator('[data-recommended-product]')).toBeVisible();

    // Verify CTA to product page
    await page.click('a:has-text("View Product")');
    await expect(page).toHaveURL(/\/products\//);
  });
});
```

#### Phase 3: Search and Filters

**File:** `tests/search-filters.spec.ts`

```typescript
test.describe('Search and Filtering', () => {
  test('should filter collection by category', async ({ page }) => {
    await page.goto('/collections/all');

    // Apply filter
    await page.click('[data-filter="category"] button:has-text("Compound")');

    // Verify results filtered
    const products = page.locator('[data-product-card]');
    await expect(products.first()).toBeVisible();

    // Verify URL updated
    await expect(page).toHaveURL(/category=compound/);
  });

  test('should search and find products', async ({ page }) => {
    await page.goto('/');

    // Open search
    await page.click('[aria-label="Search"]');
    await page.fill('input[type="search"]', 'compound microscope');
    await page.press('input[type="search"]', 'Enter');

    // Verify results
    await expect(page.locator('[data-search-results]')).toBeVisible();
    await expect(page.locator('[data-product-card]')).toHaveCount.greaterThan(0);
  });
});
```

#### Phase 4: Analytics Validation

**File:** `tests/analytics.spec.ts`

```typescript
test.describe('Analytics Events', () => {
  test('should fire GA4 page_view event', async ({ page }) => {
    const events = [];

    page.on('request', req => {
      if (req.url().includes('google-analytics.com/g/collect')) {
        events.push({ type: 'page_view', url: req.url() });
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    expect(events.length).toBeGreaterThan(0);
  });

  test('should fire add_to_cart event', async ({ page }) => {
    const events = [];

    page.on('request', req => {
      if (req.url().includes('google-analytics.com/g/collect')) {
        const url = new URL(req.url());
        const eventName = url.searchParams.get('en');
        if (eventName === 'add_to_cart') {
          events.push({ event: eventName });
        }
      }
    });

    await page.goto('/products/compound-microscope');
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(2000);

    expect(events.filter(e => e.event === 'add_to_cart').length).toBeGreaterThan(0);
  });
});
```

### Coverage Goals

| Category | Current | Q1 2025 Target | Q2 2025 Target |
|----------|---------|----------------|----------------|
| E2E Tests | 17 | 30 | 50 |
| Unit Tests | TBD | 100 | 200 |
| API Tests | 0 | 10 | 20 |
| Visual Regression | 0 | 5 pages | 15 pages |

---

## Monthly Review Dashboard

### Metrics to Track

1. **Performance**
   - Lighthouse scores (trend)
   - Core Web Vitals (p75 mobile)
   - Bundle size (JS, CSS, total)

2. **Quality**
   - Test pass rate
   - Code coverage
   - ESLint warnings trend

3. **Security**
   - Dependency vulnerabilities
   - npm audit results
   - Secret scanning alerts

4. **Availability**
   - Uptime percentage
   - Error rate
   - Deployment success rate

5. **User Experience**
   - Conversion rate
   - Cart abandonment rate
   - Search success rate

### Dashboard Template

**File:** `MONTHLY_REVIEW_TEMPLATE.md`

```markdown
# Monthly Review - [Month YYYY]

## Performance Metrics

### Lighthouse Scores
| Page | Performance | A11y | Best Practices | SEO |
|------|-------------|------|----------------|-----|
| Homepage | 92 (+2) | 98 (+1) | 96 (→) | 100 (→) |
| Collections | 90 (→) | 97 (-1) | 95 (→) | 98 (→) |
| Products | 91 (+1) | 98 (→) | 96 (→) | 100 (→) |

### Core Web Vitals (p75 Mobile)
| Metric | Current | Previous | Change | Status |
|--------|---------|----------|--------|--------|
| LCP | 2.1s | 2.3s | -0.2s ✅ | Good |
| INP | 180ms | 175ms | +5ms ⚠️ | Good |
| CLS | 0.05 | 0.06 | -0.01 ✅ | Good |

### Bundle Size
| Asset | Size | Budget | Utilization | Trend |
|-------|------|--------|-------------|-------|
| JavaScript | 1240 KB | 1300 KB | 95% | +2.7% ⚠️ |
| CSS | 125 KB | 150 KB | 83% | +3.3% |
| Total | 1365 KB | 1450 KB | 94% | +2.8% |

**Action Items:**
- [ ] Investigate JS bundle growth (33 KB increase)
- [ ] Consider code splitting for quiz module

## Quality Metrics

### Tests
- Total Tests: 47
- Pass Rate: 100%
- E2E Tests Added: 5 new checkout flow tests
- Coverage: TBD (set up coverage tracking)

### Code Quality
- TypeScript Errors: 0
- ESLint Warnings: 17 (no change)
- Security Vulnerabilities: 0 high/critical

## Deployments

| Date | Version | Status | Rollback | Notes |
|------|---------|--------|----------|-------|
| 2024-10-01 | v1.0.0 | ✅ Success | No | Initial launch |
| 2024-10-15 | v1.1.0 | ✅ Success | No | Quiz feature |

## Incidents

- None this month

## Action Items for Next Month

- [ ] Reduce JS bundle size to <1200 KB
- [ ] Improve INP to <150ms
- [ ] Add visual regression tests
- [ ] Set up code coverage tracking
- [ ] Review and update dependencies
```

### Automation

**Script:** `scripts/generate-monthly-review.mjs`

```bash
#!/usr/bin/env node

// Fetches data from:
// - GitHub Actions artifacts (Lighthouse baselines)
// - Vercel Analytics API
// - GA4 API
// - npm audit results

// Generates markdown report
// Compares with previous month
// Highlights regressions/improvements

node scripts/generate-monthly-review.mjs > MONTHLY_REVIEW_$(date +%Y%m).md
```

---

## Alerts and Notifications

### Slack Webhook Setup

1. Create Slack incoming webhook
2. Add to GitHub repository secrets: `SLACK_WEBHOOK_URL`
3. Configured in scheduled-governance.yml

### Alert Triggers

| Event | Threshold | Notification |
|-------|-----------|--------------|
| Lighthouse score drop | >5 points | Slack + GitHub Issue |
| Bundle size increase | >10% | Slack + Block PR |
| Security vulnerability | High/Critical | Slack + Email + Block PR |
| Test failure | Any | Slack |
| Deployment failure | Any | Slack + Email |
| Error rate spike | >1% | Slack + PagerDuty |
| Core Web Vitals regression | LCP >3s, CLS >0.15 | Slack |

### Example Slack Message

```json
{
  "text": "⚠️ Performance Regression Detected",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Performance Regression on PR #123*\n\nLighthouse Performance Score dropped from 92 to 85 (-7 points)"
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*LCP:* 2.1s → 2.8s (+0.7s)"},
        {"type": "mrkdwn", "text": "*Bundle:* 1240 KB → 1350 KB (+110 KB)"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View PR"},
          "url": "https://github.com/org/repo/pull/123"
        },
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Lighthouse Report"},
          "url": "https://github.com/org/repo/actions/runs/123"
        }
      ]
    }
  ]
}
```

---

## Quick Reference

### Commands

```bash
# Run Lighthouse CI locally
lhci autorun

# Generate bundle analysis
ANALYZE=true npm run build

# Check for dependency updates
npm outdated

# Security audit
npm audit

# Capture CWV baseline
node scripts/capture-cwv-baseline.mjs

# Generate monthly review
node scripts/generate-monthly-review.mjs
```

### Files

- [.lighthouserc.json](./.lighthouserc.json) - Lighthouse CI config
- [lighthouse-ci.yml](./.github/workflows/lighthouse-ci.yml) - CI workflow
- [scheduled-governance.yml](./.github/workflows/scheduled-governance.yml) - Weekly audits
- [renovate.json](./renovate.json) - Dependency updates (to create)

### Resources

- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Renovate Docs](https://docs.renovatebot.com/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

---

**Last Updated:** 2024-10-24
**Next Review:** 2024-11-24
