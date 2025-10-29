## Observability & Monitoring Setup

Comprehensive monitoring configuration for production deployment.

## 1. GitHub Actions Alerts

### Build Failures

Add to `.github/workflows/deployment-gates.yml`:

```yaml
# At the end of deployment-ready job
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '🚨 Deployment gate failed! Check the logs.'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Enable Email Notifications

1. Go to GitHub repository → Settings → Notifications
2. Enable "Email" for workflow failures
3. Add team members to watch list

## 2. Error Monitoring (Sentry)

### Installation

```bash
npm install --save @sentry/nextjs
```

### Configuration

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  profilesSampleRate: 0.1,

  // Filter out known issues
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Alert Rules

Configure in Sentry dashboard:

1. **High Error Rate**: > 10 errors/minute → Slack/Email
2. **New Issue**: First occurrence → Email
3. **Performance Degradation**: P95 > 3s → Slack
4. **Failed Transactions**: > 5% → Email

## 3. Core Web Vitals Monitoring

### Web Vitals Script

Add to `src/app/layout.tsx`:

```typescript
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Log threshold breaches
  const thresholds = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800,
    INP: 200,
  };

  if (metric.value > thresholds[metric.name as keyof typeof thresholds]) {
    console.warn(`⚠️ ${metric.name} threshold breached:`, {
      value: metric.value,
      threshold: thresholds[metric.name as keyof typeof thresholds],
    });

    // Send alert
    fetch('/api/vitals-alert', {
      method: 'POST',
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        threshold: thresholds[metric.name as keyof typeof thresholds],
        url: window.location.href,
      }),
    });
  }
}
```

### BigQuery Export (Optional)

Create `src/app/api/vitals/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    await bigquery
      .dataset('analytics')
      .table('web_vitals')
      .insert([
        {
          timestamp: new Date().toISOString(),
          metric_name: metric.name,
          value: metric.value,
          url: metric.url,
          user_agent: request.headers.get('user-agent'),
        },
      ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging vitals:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
```

## 4. Bundle Size Monitoring

### GitHub Action for Bundle Diff

Create `.github/workflows/bundle-size.yml`:

```yaml
name: Bundle Size Check

on:
  pull_request:
    branches: [main]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: npm run audit:bundle

      - name: Compare with main
        run: |
          git fetch origin main
          git checkout origin/main
          npm ci
          npm run build
          BASELINE_SIZE=$(du -sk .next | cut -f1)

          git checkout -
          npm ci
          npm run build
          CURRENT_SIZE=$(du -sk .next | cut -f1)

          DIFF=$((CURRENT_SIZE - BASELINE_SIZE))
          PERCENT=$(awk "BEGIN {printf \"%.1f\", ($DIFF/$BASELINE_SIZE)*100}")

          echo "Bundle size change: ${DIFF}KB (${PERCENT}%)"

          if [ $DIFF -gt 100 ]; then
            echo "⚠️ Bundle size increased by more than 100KB"
            exit 1
          fi
```

## 5. Uptime Monitoring

### UptimeRobot Configuration

1. Sign up at uptimerobot.com
2. Add monitors for:
   - Homepage: `https://store.labessentials.com/`
   - Product page: `https://store.labessentials.com/products/[handle]`
   - Cart: `https://store.labessentials.com/cart`
   - Search: `https://store.labessentials.com/search`

3. Configure alerts:
   - Check interval: 5 minutes
   - Alert contacts: team@labessentials.com
   - Alert after: 2 failed checks

### Status Page

Create a public status page to show uptime history.

## 6. Analytics Parity Monitoring

### Daily Analytics Report

Create `scripts/analytics-parity-check.mjs`:

```javascript
#!/usr/bin/env node

import { google } from '@google-analytics/data';

const propertyId = process.env.GA4_PROPERTY_ID;
const analyticsDataClient = new google.analytics.data.v1beta.BetaAnalyticsDataClient();

async function checkParity() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: 'yesterday',
        endDate: 'yesterday',
      },
    ],
    dimensions: [
      {
        name: 'eventName',
      },
    ],
    metrics: [
      {
        name: 'eventCount',
      },
    ],
  });

  // Compare with Shopify admin data
  const ga4Revenue = parseFloat(response.rows?.find(r => r.dimensionValues?.[0]?.value === 'purchase')?.metricValues?.[0]?.value || '0');
  const shopifyRevenue = await getShopifyRevenue(); // Implement this

  const parity = Math.abs(ga4Revenue - shopifyRevenue) / shopifyRevenue * 100;

  if (parity > 3) {
    console.error(`❌ Analytics parity breach: ${parity.toFixed(2)}% difference`);
    // Send alert
    process.exit(1);
  }

  console.log(`✅ Analytics parity check passed: ${parity.toFixed(2)}% difference`);
}

checkParity().catch(console.error);
```

Schedule via cron:

```bash
# Daily at 9 AM
0 9 * * * cd /path/to/project && node scripts/analytics-parity-check.mjs
```

## 7. Performance Budget Alerts

### Lighthouse CI Server (Optional)

```bash
# Install LHCI server
npm install -g @lhci/server

# Start server
lhci server --port=9001 --storage.storageMethod=sql \
  --storage.sqlDatabasePath=./lhci.db
```

Configure alerts in `.lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      /* ... */
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: 'http://localhost:9001',
    },
  },
};
```

## 8. Slack Alerts Integration

### Create Incoming Webhook

1. Go to Slack → Apps → Incoming Webhooks
2. Create webhook for #deployments channel
3. Add to GitHub Secrets: `SLACK_WEBHOOK`

### Alert Script

Create `scripts/send-alert.sh`:

```bash
#!/bin/bash

WEBHOOK_URL=$1
MESSAGE=$2
LEVEL=${3:-info}

case $LEVEL in
  error)
    EMOJI="🚨"
    COLOR="#ff0000"
    ;;
  warning)
    EMOJI="⚠️"
    COLOR="#ffaa00"
    ;;
  success)
    EMOJI="✅"
    COLOR="#00ff00"
    ;;
  *)
    EMOJI="ℹ️"
    COLOR="#0000ff"
    ;;
esac

curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "{
    \"text\": \"$EMOJI $MESSAGE\",
    \"attachments\": [{
      \"color\": \"$COLOR\",
      \"fields\": [
        {
          \"title\": \"Environment\",
          \"value\": \"Production\",
          \"short\": true
        },
        {
          \"title\": \"Timestamp\",
          \"value\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
          \"short\": true
        }
      ]
    }]
  }"
```

## 9. Monitoring Dashboard

### Vercel Analytics (Built-in)

If deployed on Vercel:

1. Go to project → Analytics
2. Enable "Web Analytics"
3. Monitor:
   - Core Web Vitals (LCP, FID, CLS)
   - Top pages by traffic
   - Visitor locations
   - Device breakdown

### Custom Dashboard (Grafana)

```yaml
# docker-compose.yml for monitoring stack
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - ./grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## 10. Automated Health Checks

### Cron Jobs

Add to crontab:

```bash
# Weekly audit (Sunday 2 AM)
0 2 * * 0 cd /path/to/project && npm run pre-deploy:quick >> /var/log/weekly-audit.log 2>&1

# Daily smoke tests (Daily 6 AM)
0 6 * * * cd /path/to/project && PRODUCTION_URL=https://store.labessentials.com npm run test:smoke >> /var/log/daily-smoke.log 2>&1

# Hourly uptime check
0 * * * * curl -f https://store.labessentials.com/api/health-check || echo "Health check failed" | mail -s "Site Down" team@labessentials.com
```

### GitHub Actions Schedule

Add to `.github/workflows/scheduled-checks.yml`:

```yaml
name: Scheduled Health Checks

on:
  schedule:
    # Weekly on Sunday at 2 AM UTC
    - cron: '0 2 * * 0'

jobs:
  weekly-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run pre-deploy:quick

      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"🚨 Weekly audit failed! Check GitHub Actions logs."}'
```

## Summary Checklist

- [ ] GitHub Actions email notifications enabled
- [ ] Sentry error monitoring configured
- [ ] Core Web Vitals tracking implemented
- [ ] Bundle size monitoring in CI
- [ ] Uptime monitoring service configured
- [ ] Analytics parity checks scheduled
- [ ] Slack alerts integrated
- [ ] Monitoring dashboard set up
- [ ] Automated health checks scheduled
- [ ] Alert thresholds configured
- [ ] Escalation procedures documented

## Alert Thresholds Reference

| Metric | Warning | Critical | Action |
|--------|---------|----------|---------|
| Error Rate | > 1% | > 5% | Investigate immediately |
| LCP | > 2.5s | > 4s | Optimize images/code |
| INP | > 200ms | > 500ms | Review JS execution |
| CLS | > 0.1 | > 0.25 | Fix layout shifts |
| Uptime | < 99.5% | < 99% | Check infrastructure |
| Bundle Size | +10% | +20% | Review added dependencies |
| Analytics Parity | > 3% | > 10% | Audit tracking code |

---

**Last Updated:** 2025-10-24
**Maintained By:** Lab Essentials Engineering Team
