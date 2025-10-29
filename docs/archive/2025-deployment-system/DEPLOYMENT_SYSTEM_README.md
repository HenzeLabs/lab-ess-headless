# Deployment System Documentation

Complete deployment infrastructure for Lab Essentials headless Shopify storefront.

## 🎯 System Overview

This deployment system provides **enterprise-grade quality gates** and **automated governance** for production deployments. It ensures every deployment meets strict quality, performance, security, and accessibility standards.

### Key Features

✅ **Automated Quality Gates** - Pre-deployment validation catches issues before production
✅ **Comprehensive Testing** - Unit, integration, E2E, performance, and accessibility tests
✅ **Security Hardening** - Secret scanning, vulnerability checks, CSP validation
✅ **Performance Budgets** - Bundle size and Core Web Vitals enforcement
✅ **SEO Validation** - Meta tags, structured data, sitemap checks
✅ **One-Click Rollback** - Emergency rollback in < 60 seconds
✅ **Continuous Monitoring** - Weekly audits and dependency tracking
✅ **Full Observability** - Error tracking, analytics, performance monitoring

---

## 📁 File Structure

```
lab-ess-headless/
├── .github/
│   └── workflows/
│       ├── deployment-gates.yml          # CI/CD deployment pipeline
│       └── scheduled-governance.yml      # Weekly audits & monitoring
├── scripts/
│   ├── prepare-release.sh                # Release preparation
│   ├── emergency-rollback.sh             # Fast production rollback
│   ├── pre-deploy-checklist.mjs          # Complete deployment audit
│   ├── deployment-audit.mjs              # Main audit orchestrator
│   ├── check-security.mjs                # Security scanning
│   ├── check-bundle-size.mjs             # Bundle analysis
│   ├── validate-seo.mjs                  # SEO validation
│   └── check-links.mjs                   # Link crawler
├── tests/
│   └── post-deploy-smoke.spec.ts         # Production smoke tests
├── deployment-gates.config.json          # Gate thresholds configuration
├── DEPLOYMENT_PLAYBOOK.md                # Step-by-step deployment guide
├── DEPLOYMENT_AUDIT.md                   # Complete audit documentation
├── DEPLOYMENT_QUICK_REFERENCE.md         # Quick command reference
├── ROLLBACK_PROCEDURES.md                # Emergency procedures
├── OBSERVABILITY_SETUP.md                # Monitoring configuration
└── README.md                             # This file
```

---

## 🚀 Quick Start

### Daily Development

```bash
# Before committing
npm run typecheck
npm run lint

# Before creating PR
npm run pre-deploy:quick  # ~15 seconds
```

### Before Deployment

```bash
# Full pre-deployment audit
npm run pre-deploy  # ~5-10 minutes

# Expected: ✅ DEPLOYMENT APPROVED
```

### Deploying to Production

```bash
# 1. Prepare release
npm run release:prepare v1.0.0

# 2. Push tag
git push origin v1.0.0

# 3. Deploy
vercel --prod

# 4. Verify
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke
```

### Emergency Rollback

```bash
# Interactive rollback
./scripts/emergency-rollback.sh

# Or manual
vercel rollback [previous-deployment-url]
```

---

## 📋 Available Commands

### Audit Commands

| Command | Purpose | Duration | When to Use |
|---------|---------|----------|-------------|
| `npm run pre-deploy` | Full deployment audit | 5-10 min | Before every production deploy |
| `npm run pre-deploy:quick` | Fast audit (no tests) | 15 sec | During development, before PR |
| `npm run audit:security` | Security scan only | 5 sec | After dependency updates |
| `npm run audit:seo` | SEO validation only | 3 sec | After meta tag changes |
| `npm run audit:bundle` | Bundle size check | 2 sec | After adding dependencies |
| `npm run test:smoke` | Production smoke tests | 2-3 min | After deployment |

### Testing Commands

| Command | Purpose | Duration |
|---------|---------|----------|
| `npm run test:all` | All Playwright tests | 10-15 min |
| `npm run test:core` | Critical user flows | 3-5 min |
| `npm run test:a11y` | Accessibility tests | 2-3 min |
| `npm run test:seo` | SEO tests | 2 min |
| `npm run test:links` | Link validation | 1-2 min |

### Release Commands

| Command | Purpose |
|---------|---------|
| `npm run release:prepare v1.0.0` | Prepare production release |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint validation |
| `npm run build` | Production build |

---

## 🎚️ Quality Gates Configuration

All thresholds are defined in `deployment-gates.config.json`.

### Hard Gates (Must Pass)

These **block deployment** if they fail:

#### 1. Tests
- Pass rate: 100%
- Flaky tests: 0

#### 2. Performance (Lighthouse Mobile)
- Performance: ≥ 90
- SEO: ≥ 95
- Best Practices: ≥ 95
- PWA: ≥ 95
- Accessibility: ≥ 95

#### 3. Core Web Vitals (p75 Mobile)
- LCP: ≤ 2.5s
- INP: ≤ 200ms
- CLS: ≤ 0.1

#### 4. Security
- Console errors: 0
- Broken links: 0
- Critical a11y issues: 0
- High/Critical vulnerabilities: 0

#### 5. Bundle Size
- JavaScript: ≤ 1300 KB
- CSS: ≤ 150 KB
- Third-party: ≤ 200 KB

### Adjusting Thresholds

Edit `deployment-gates.config.json`:

```json
{
  "hardGates": {
    "lighthouse": {
      "mobile": {
        "performance": 90,  // Adjust as needed
        "seo": 95
      }
    },
    "cwv": {
      "lcp": 2500,  // milliseconds
      "inp": 200,
      "cls": 0.1
    }
  },
  "performanceBudgets": {
    "bundle": {
      "maxJsKb": 1300,  // Adjust based on features
      "maxCssKb": 150
    }
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Trigger:** Push to `main`, PR to `main`, manual dispatch

**Jobs:**
1. **Code Quality** (3 min)
   - TypeScript check
   - ESLint validation
   - Brand token validation

2. **Security Audit** (2 min)
   - Secret scanning
   - npm audit
   - Security headers check

3. **Build & Bundle** (5 min)
   - Production build
   - Bundle size analysis

4. **Tests** (10 min, parallel)
   - Core functional tests
   - Accessibility tests
   - SEO tests

5. **Lighthouse** (5 min)
   - Performance audit
   - PWA validation

6. **Deployment Ready** (1 min)
   - Final gate check
   - Generate report
   - PR comment (if applicable)

**Total Duration:** ~15-20 minutes

### Continuous Governance

**Schedule:** Weekly (Sunday 2 AM UTC)

**Tasks:**
- Run full quality audit
- Check bundle size trends
- Scan for vulnerabilities
- Monitor dependency updates
- Generate governance report

---

## 📊 Monitoring & Alerts

### Real-Time Monitoring

**Metrics tracked:**
- Error rate (target: < 0.1%)
- Response time (target: < 2s)
- Core Web Vitals (LCP, INP, CLS)
- Uptime (target: 99.9%)
- Conversion events

**Tools:**
- Vercel Analytics (built-in)
- Sentry (error tracking, optional)
- GA4 (analytics)
- Custom Web Vitals tracking

### Alerting

**Critical Alerts** (immediate response):
- Site down (< 5 min)
- Error rate > 5%
- Payment/checkout broken

**Warning Alerts** (investigate within 1 hour):
- Error rate 1-5%
- Performance degradation
- Analytics discrepancy

**Info Alerts** (review next business day):
- Dependency updates available
- Weekly audit results
- Bundle size increased

### Setting Up Alerts

See [OBSERVABILITY_SETUP.md](./OBSERVABILITY_SETUP.md) for:
- Sentry configuration
- Slack webhook integration
- Email notifications
- Custom dashboards

---

## 🔐 Security

### Secret Management

**Never commit:**
- `.env` files
- API keys or tokens
- Shopify credentials

**Use:**
- Environment variables via Vercel
- GitHub Secrets for CI/CD
- Password manager for backups

### Security Scanning

**Automated checks:**
- Secret detection in repo history
- npm vulnerability scanning
- Security header validation
- CSP policy verification

**Manual reviews:**
- Quarterly security audit
- Dependency license compliance
- API scope validation

---

## 📈 Performance Optimization

### Current Performance

- **Bundle Size:** 1207 KB JS, 121 KB CSS
- **First Load:** ~285 KB shared chunks
- **Lighthouse Score:** 90+ (mobile)
- **Core Web Vitals:** Green (LCP < 2.5s, INP < 200ms, CLS < 0.1)

### Optimization Checklist

- [x] Code splitting by route
- [x] Dynamic imports for heavy components
- [x] Image optimization (WebP/AVIF)
- [x] Font loading optimization
- [x] Third-party script limiting
- [x] Edge caching configured
- [x] ISR for static content
- [ ] Service Worker for offline (PWA)

---

## 🎓 Training & Onboarding

### For New Team Members

1. **Read Documentation** (30 min)
   - [DEPLOYMENT_PLAYBOOK.md](./DEPLOYMENT_PLAYBOOK.md)
   - [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)

2. **Run Local Audit** (5 min)
   ```bash
   npm install
   npm run pre-deploy:quick
   ```

3. **Practice Deployment** (15 min)
   - Deploy to personal Vercel account
   - Run smoke tests
   - Practice rollback

4. **Shadow a Deployment** (30 min)
   - Watch experienced team member deploy
   - Ask questions
   - Take notes

### For Experienced Developers

**Quick Reference:**
```bash
# Daily
npm run typecheck && npm run lint

# Before PR
npm run pre-deploy:quick

# Before deploy
npm run pre-deploy

# Deploy
npm run release:prepare v1.0.0
git push origin v1.0.0
vercel --prod

# Verify
npm run test:smoke

# Emergency
./scripts/emergency-rollback.sh
```

---

## 🐛 Troubleshooting

### Deployment Audit Fails

**Problem:** `npm run pre-deploy` reports failures

**Solutions:**
1. Check which gate failed in output
2. Run specific audit: `npm run audit:security`
3. Fix issues and re-run
4. See [DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md) for details

### Build Fails

**Problem:** `npm run build` fails

**Solutions:**
1. Check TypeScript: `npm run typecheck`
2. Check ESLint: `npm run lint`
3. Clear cache: `rm -rf .next && npm run build`
4. Check environment variables: `npm run verify:env`

### Tests Fail

**Problem:** Playwright tests failing

**Solutions:**
1. Run locally: `npm run test:core`
2. Check if dev server is running
3. Update Playwright: `npm install @playwright/test@latest`
4. Clear browser cache: `npx playwright install --force`

### Performance Issues

**Problem:** Lighthouse score < 90

**Solutions:**
1. Run bundle analysis: `npm run analyze`
2. Check image optimization
3. Review third-party scripts
4. Check Core Web Vitals: `npm run test:perf`

---

## 📚 Additional Resources

### Documentation

- **[DEPLOYMENT_PLAYBOOK.md](./DEPLOYMENT_PLAYBOOK.md)** - Complete deployment guide
- **[DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md)** - Audit system details
- **[ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md)** - Emergency procedures
- **[OBSERVABILITY_SETUP.md](./OBSERVABILITY_SETUP.md)** - Monitoring setup

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Support

- **Internal:** #engineering Slack channel
- **On-Call:** See DEPLOYMENT_PLAYBOOK.md for contacts
- **Vercel Support:** support@vercel.com (if on paid plan)

---

## 🗓️ Maintenance Schedule

### Daily
- Automated: Error monitoring
- Automated: Uptime checks

### Weekly
- Automated: Quality audit (GitHub Actions)
- Automated: Dependency scanning
- Manual: Review audit reports (15 min)

### Monthly
- Manual: Review bundle size trends (30 min)
- Manual: Update dependencies (1 hour)
- Manual: Performance audit (30 min)

### Quarterly
- Manual: Review and update gate thresholds (1 hour)
- Manual: Security audit (2 hours)
- Manual: Test rollback procedures (30 min)
- Manual: Update documentation (1 hour)

---

## 📝 Changelog

### v1.0.0 (2025-10-24)
- Initial deployment system
- Comprehensive quality gates
- Automated governance
- Complete documentation

---

## 👥 Contributors

Maintained by Lab Essentials Engineering Team

**Primary Maintainers:**
- DevOps Team
- Frontend Engineering
- QA Team

**Contact:** engineering@labessentials.com

---

## 📄 License

Internal use only - Lab Essentials

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
**Status:** Production Ready ✅
