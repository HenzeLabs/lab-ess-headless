# Deployment Quick Reference

Fast reference for running deployment audits and understanding gate requirements.

## Quick Commands

```bash
# Full pre-deployment check (recommended)
npm run pre-deploy

# Quick check (skip slow tests)
npm run pre-deploy:quick

# Test staging environment
npm run pre-deploy:staging -- --staging-url=https://your-staging.vercel.app

# Individual audits
npm run audit:security      # Security scan
npm run audit:seo          # SEO validation
npm run audit:bundle       # Bundle size check
npm run test:links         # Link validation
```

## Gate Thresholds (Must Pass)

### Performance (Lighthouse Mobile)
| Metric | Threshold |
|--------|-----------|
| Performance | ≥ 90 |
| SEO | ≥ 95 |
| Best Practices | ≥ 95 |
| PWA | ≥ 95 |
| Accessibility | ≥ 95 |

### Core Web Vitals (p75 Mobile)
| Metric | Threshold |
|--------|-----------|
| LCP (Largest Contentful Paint) | ≤ 2.5s |
| INP (Interaction to Next Paint) | ≤ 200ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |

### Bundle Size
| Asset | Budget |
|-------|--------|
| JavaScript | ≤ 220 KB |
| Third-party JS | ≤ 150 KB |
| CSS | ≤ 50 KB |
| Fonts | ≤ 100 KB |

### Tests & Quality
- **Test Pass Rate:** 100%
- **Flaky Tests:** 0
- **Console Errors:** 0
- **Broken Links:** 0
- **Critical a11y Issues:** 0
- **High/Critical Vulnerabilities:** 0

## Pre-Launch Checklist

### Day Before Launch
```bash
# 1. Freeze content changes
# 2. Run full audit
npm run pre-deploy

# 3. Fix any failures
# 4. Verify staging
npm run pre-deploy:staging -- --staging-url=https://staging.labessentials.com

# 5. Build and analyze
npm run build
npm run analyze

# 6. Run all tests
npm run test:all
```

### Launch Day
```bash
# 1. Final check
npm run pre-deploy:quick

# 2. Deploy
vercel --prod  # or your deployment command

# 3. Verify production
npm run test:links -- --url=https://store.labessentials.com

# 4. Monitor for 24 hours
# - Error rates (< 0.1%)
# - Core Web Vitals
# - Checkout conversion
# - Revenue parity
```

## Common Issues & Fixes

### Bundle Size Too Large
```bash
# Analyze bundle
npm run analyze

# Check for large dependencies
npx bundle-wizard

# Optimize images
npm run optimize:images
```

### Failed Tests
```bash
# Run specific test suite
npm run test:core
npm run test:a11y
npm run test:seo

# Debug mode
npm run test:core -- --debug
```

### Security Vulnerabilities
```bash
# Check vulnerabilities
npm audit

# Auto-fix
npm audit fix

# Manual review
npm run audit:security
```

### Lighthouse Failures
```bash
# Run Lighthouse locally
npm run lh

# Check specific URL
npx lighthouse https://your-site.com --view

# Mobile emulation
npx lighthouse https://your-site.com --preset=desktop --view
```

## CI/CD Status

View deployment gate status:
- GitHub: `https://github.com/your-org/lab-ess-headless/actions`
- Vercel: `https://vercel.com/your-org/lab-ess-headless/deployments`

## Emergency Rollback

### Vercel
```bash
vercel ls
vercel rollback [deployment-url]
```

### Manual
```bash
git revert HEAD
git push origin main
```

## Monitoring URLs

After deployment, monitor these dashboards:
- Analytics: https://analytics.google.com
- Search Console: https://search.google.com/search-console
- Error Monitoring: https://sentry.io (if configured)
- Uptime: Your monitoring service

## File Structure

```
scripts/
├── check-bundle-size.mjs      # Bundle size validation
├── check-links.mjs            # Link checker & 404 validator
├── check-security.mjs         # Security audit
├── validate-seo.mjs           # SEO validation
├── deployment-audit.mjs       # Main audit orchestrator
└── pre-deploy-checklist.mjs   # Complete pre-deploy check

deployment-gates.config.json    # Gate configuration
DEPLOYMENT_AUDIT.md            # Full documentation
```

## Help & Support

```bash
# View script help
node scripts/pre-deploy-checklist.mjs --help

# View configuration
cat deployment-gates.config.json

# Check package scripts
npm run
```

## Configuration Files

### [deployment-gates.config.json](./deployment-gates.config.json)
Master configuration for all gate thresholds and budgets.

### [next.config.mjs](./next.config.mjs)
Security headers, performance optimizations, image config.

### [playwright.config.ts](./playwright.config.ts)
Test configuration, browsers, devices.

### [lighthouse.config.js](./lighthouse.config.js)
Lighthouse CI configuration.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed ✅ |
| 1 | Critical failure ❌ |

## Quick Diagnosis

### Site is slow
1. Run `npm run lh` - check Lighthouse scores
2. Run `npm run analyze` - check bundle size
3. Check Core Web Vitals in production

### Deployment blocked
1. Run `npm run pre-deploy` - see what failed
2. Check CI logs in GitHub Actions
3. Review `deployment-audit-results.json`

### SEO issues
1. Run `npm run audit:seo`
2. Run `npm run test:seo`
3. Validate structured data: https://search.google.com/test/rich-results

### Security concerns
1. Run `npm run audit:security`
2. Run `npm audit`
3. Review security headers in `next.config.mjs`

---

**Quick Tip:** Bookmark this page and [DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md) for easy reference.
