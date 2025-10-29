# Lighthouse CI Integration Guide

## Overview

Automated Lighthouse performance audits integrated into your CI/CD pipeline to prevent performance regressions.

## Files Created

1. **`.github/workflows/lighthouse-ci.yml`** - GitHub Actions workflow
2. **`lighthouserc.json`** - Lighthouse CI configuration

## Performance Thresholds

The CI will fail builds if scores fall below:

| Category | Threshold | Current Score |
|----------|-----------|---------------|
| **Performance** | ≥ 85% | 71% (needs improvement) |
| **Accessibility** | ≥ 90% | TBD |
| **Best Practices** | ≥ 90% | TBD |
| **SEO** | ≥ 90% | TBD |

### Core Web Vitals Thresholds

| Metric | Threshold | Current |
|--------|-----------|---------|
| **FCP** | < 2.0s | 0.92s ✅ |
| **LCP** | < 2.5s | 6.08s ❌ |
| **CLS** | < 0.1 | 0.000 ✅ |
| **TBT** | < 200ms | 215ms ⚠️ |

## Setup Instructions

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

```bash
# Settings → Secrets and variables → Actions → New repository secret

SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
```

### 2. Optional: Lighthouse CI Server

For persistent result storage and trending:

```bash
# Install Lighthouse CI server
npm install -g @lhci/server

# Initialize database
lhci server --storage.sqlDatabasePath=./lhci.db

# Run server
lhci server --port=9001
```

Then update `lighthouserc.json`:

```json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://your-lhci-server.com"
    }
  }
}
```

### 3. Local Testing

Test Lighthouse CI locally before pushing:

```bash
# Install LHCI
npm install -g @lhci/cli

# Build and start server
npm run build
npm run start

# Run Lighthouse CI
lhci autorun
```

## Workflow Behavior

### On Push to Main/Develop
- Builds production bundle
- Runs Lighthouse audits on 3 URLs
- Each URL tested 3 times (median score used)
- Uploads results to temporary public storage
- Fails build if thresholds not met

### On Pull Request
- Same as above
- Adds Lighthouse report comment to PR
- Shows performance diff vs base branch

## What Gets Audited

1. **Homepage** (`/`)
2. **Collection Page** (`/collections/microscopes`)
3. **Product Page** (`/products/13-3-camera-monitor`)

Each page is tested for:
- Performance
- Accessibility
- Best Practices
- SEO

## Performance Budget

Current budgets set in `lighthouserc.json`:

```json
{
  "FCP": "2000ms",
  "LCP": "2500ms",
  "CLS": "0.1",
  "TBT": "200ms"
}
```

## Viewing Results

### Temporary Public Storage
Results are uploaded to Lighthouse CI's temporary storage (7-day retention):
- URL provided in CI logs
- Shareable public link

### GitHub Actions Artifacts
Results saved as artifacts:
- Navigate to Actions → Workflow run → Artifacts
- Download `lighthouse-results.zip`
- View HTML reports locally

## Customization

### Add More URLs

Edit `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/collections/microscopes",
        "http://localhost:3000/products/13-3-camera-monitor",
        "http://localhost:3000/cart",           // Add cart page
        "http://localhost:3000/pages/about"     // Add about page
      ]
    }
  }
}
```

### Adjust Thresholds

Edit assertion targets in `lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.90}],  // Stricter
        "largest-contentful-paint": ["warn", {"maxNumericValue": 3000}]  // Warning only
      }
    }
  }
}
```

### Mobile vs Desktop

Default: Desktop preset

For mobile audits, update `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "mobile",  // Change to mobile
        "throttling": {
          "rttMs": 150,
          "throughputKbps": 1638,
          "cpuSlowdownMultiplier": 4
        }
      }
    }
  }
}
```

## Troubleshooting

### Build Fails Due to Performance

**Current Gap**: Performance at 71%, threshold at 85%

**Solution**: Complete remaining optimizations:
1. Remove Meta Pixel (-4 points)
2. Enhanced SW caching (+3 points)
3. Bundle optimization (+4 points)
4. Advanced image optimization (+3 points)

**Total**: Should reach 85%+

### Server Not Starting in CI

Check:
- Environment variables are set correctly
- Port 3000 is not in use
- Build completes successfully

### Inconsistent Scores

Lighthouse scores can vary ±5 points. Solutions:
- Use median of 3 runs (already configured)
- Run on consistent hardware (GitHub Actions)
- Set appropriate throttling settings

## Integration with Other Tools

### Slack Notifications

Add to workflow:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Lighthouse CI failed! Performance below threshold.'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Performance Budgets in package.json

```json
{
  "scripts": {
    "perf:budget": "lhci assert --budgetsFile=./performance-budgets.json"
  }
}
```

## Best Practices

1. **Run on Every PR** - Catch regressions before merge
2. **Track Trends** - Use LHCI server for historical data
3. **Set Realistic Thresholds** - Current: 85% performance, 90% others
4. **Monitor Core Web Vitals** - LCP, CLS, TBT are key metrics
5. **Test Multiple Pages** - Homepage, product, collection pages

## Expected Timeline to 85% Performance

Based on current state (71%) and remaining optimizations:

| Optimization | Estimated Gain | Timeline |
|--------------|----------------|----------|
| Remove Meta Pixel | +4 points | 30 min |
| Enhanced SW caching | +3 points | 1 hour |
| Bundle optimization | +4 points | 2 hours |
| Image optimization | +3 points | 1 hour |
| **Total** | **+14 points** | **4-5 hours** |
| **Projected Score** | **85%** | **✅ Threshold met** |

## Monitoring in Production

After deployment:

```bash
# Run Lighthouse from production URL
npx lhci autorun --collect.url=https://your-site.com
```

Or use:
- **Google PageSpeed Insights** - Real user metrics
- **Chrome User Experience Report** - Field data
- **Web Vitals Chrome Extension** - Real-time monitoring

---

## Summary

Lighthouse CI is now configured to:
- ✅ Run on every push and PR
- ✅ Test 3 critical pages
- ✅ Enforce performance budgets
- ✅ Prevent regressions
- ✅ Provide shareable reports

**Current Status**: 71% performance (needs +14 points to meet 85% threshold)

**Next Steps**: Complete remaining optimizations to pass CI checks automatically
