# Production Deployment Playbook

Complete step-by-step guide for deploying Lab Essentials headless storefront to production.

## Quick Reference

| Task | Command | Time | Critical |
|------|---------|------|----------|
| Pre-deploy audit | `npm run pre-deploy:quick` | 15s | ✅ Yes |
| Full audit | `npm run pre-deploy` | 5-10min | ⚠️ Recommended |
| Prepare release | `npm run release:prepare v1.0.0` | 30s | ✅ Yes |
| Deploy (Vercel) | `vercel --prod` | 2-3min | ✅ Yes |
| Smoke tests | `PRODUCTION_URL=https://... npm run test:smoke` | 2-3min | ✅ Yes |
| Rollback | `vercel rollback [url]` | 30s | 🚨 Emergency |

---

## Phase 1: Pre-Deployment (T-24 hours)

### 1.1 Code Freeze

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Verify working directory is clean
git status
```

**Expected:** `nothing to commit, working tree clean`

### 1.2 Run Full Audit

```bash
# Run comprehensive pre-deployment audit
npm run pre-deploy
```

**Expected Output:**
```
✅ DEPLOYMENT APPROVED
All critical checks passed. Ready for deployment!

Results:
  Total Checks:       11
  Passed:             11
  Failed:             0
  Warnings:           0
```

If any checks fail, **STOP** and fix issues before proceeding.

### 1.3 Review Changes

```bash
# Review commits since last release
git log --oneline v0.9.0..HEAD

# Review bundle size changes
npm run analyze
```

### 1.4 Update Documentation

- [ ] Update CHANGELOG.md with new features/fixes
- [ ] Update version in package.json if needed
- [ ] Review and update environment variable docs

### 1.5 Notify Stakeholders

Send pre-deployment notification:

```
Subject: Production Deployment Scheduled - [Date/Time]

Team,

We have a production deployment scheduled for:
📅 Date: [DATE]
🕐 Time: [TIME UTC]
⏱️ Expected Duration: 15-30 minutes

Changes:
- [List major changes]

Impact:
- No expected downtime
- Analytics may show brief dip during deployment

Monitoring will be active throughout.

Questions? Reply here or in #deployments
```

---

## Phase 2: Release Preparation (T-1 hour)

### 2.1 Create Release Tag

```bash
# Run release preparation script
npm run release:prepare v1.0.0
```

This script will:
1. ✅ Verify working directory is clean
2. ✅ Confirm on main branch
3. ✅ Pull latest changes
4. ✅ Run pre-deploy audit
5. ✅ Generate release notes
6. ✅ Create git tag
7. ✅ Archive audit reports

**Expected Output:**
```
✅ RELEASE PREPARATION COMPLETE

Next Steps:
1. Review release notes: cat RELEASE_NOTES_v1.0.0.md
2. Push the tag: git push origin v1.0.0
3. Deploy: vercel --prod
```

### 2.2 Push Release Tag

```bash
# Push tag to GitHub
git push origin v1.0.0
```

### 2.3 Enable Branch Protection

Temporarily freeze main branch:

1. Go to GitHub: Settings → Branches → main
2. Enable "Lock branch" (if available)
3. Or notify team: "🔒 Main branch frozen until post-deploy QA"

### 2.4 Backup Environment

```bash
# Backup production environment variables
vercel env pull .env.production.backup

# Store securely (use password manager or vault)
```

---

## Phase 3: Deployment (T-0)

### 3.1 Final Checks

```bash
# 1. Quick pre-flight check
npm run pre-deploy:quick

# 2. Verify environment variables
npm run verify:env

# 3. Check Vercel status
vercel --version
vercel whoami
```

### 3.2 Deploy to Production

```bash
# Deploy using Vercel CLI
vercel --prod

# Or trigger via GitHub Actions
# Go to: Actions → Deployment Gates → Run workflow
```

**Monitor deployment:**
- Watch Vercel deployment logs
- Check build progress
- Verify deployment URL

### 3.3 Verify Deployment

```bash
# 1. Check site is accessible
curl -I https://store.labessentials.com

# 2. Verify version deployed
curl https://store.labessentials.com/api/health-check

# 3. Check no 500 errors
# Monitor error rate in dashboard
```

**Expected:**
- HTTP 200 responses
- No console errors
- Site loads within 2-3 seconds

---

## Phase 4: Post-Deployment Verification (T+5 minutes)

### 4.1 Run Smoke Tests

```bash
# Run automated smoke tests on production
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke
```

**These tests verify:**
- ✅ Homepage loads
- ✅ Product catalog works
- ✅ Add to cart functions
- ✅ Checkout button accessible
- ✅ Search works
- ✅ Analytics firing
- ✅ Security headers present
- ✅ SEO tags correct
- ✅ Mobile responsive

**Expected:** All tests pass (green)

### 4.2 Manual Critical Path Testing

Test these flows manually:

**1. Browse & Search**
- [ ] Homepage loads completely
- [ ] Collections page displays products
- [ ] Search returns results
- [ ] Product pages load with images

**2. Add to Cart**
- [ ] Can add product to cart
- [ ] Cart updates quantity
- [ ] Cart persists on page reload

**3. Checkout Initiation**
- [ ] Proceed to checkout button works
- [ ] Redirects to Shopify checkout
- [ ] Checkout page loads

**4. Analytics Verification**
- [ ] Open browser DevTools → Network
- [ ] Filter for "google-analytics" or "analytics"
- [ ] Verify events firing (page_view, etc.)
- [ ] Check GA4 Real-Time view shows activity

### 4.3 Monitor Core Web Vitals

```bash
# Check Lighthouse scores
npx lighthouse https://store.labessentials.com --view
```

**Thresholds:**
- LCP: < 2.5s
- FID/INP: < 100ms / 200ms
- CLS: < 0.1
- Performance Score: > 90

### 4.4 Check Error Monitoring

- Open Sentry dashboard (if configured)
- Verify no new errors in last 5 minutes
- Check error rate is at baseline

### 4.5 Verify Analytics Parity

**GA4 Check:**
1. Open GA4 Real-Time view
2. Verify events flowing:
   - page_view
   - view_item
   - add_to_cart
3. Generate test event (add to cart)
4. Confirm event appears in real-time

**Meta Pixel Check:**
1. Install Meta Pixel Helper browser extension
2. Visit site
3. Verify pixel fires PageView event

---

## Phase 5: Monitoring Period (T+30 minutes to T+24 hours)

### 5.1 Immediate Monitoring (First 30 minutes)

**Watch these metrics:**

| Metric | Check Every | Threshold | Action |
|--------|-------------|-----------|--------|
| Error Rate | 5 min | < 1% | Rollback if > 5% |
| Response Time | 5 min | < 2s avg | Investigate if > 3s |
| Conversion Events | 15 min | Flowing | Check tracking if stopped |
| Uptime | 5 min | 100% | Immediate rollback if down |

**Tools to monitor:**
- Vercel Dashboard → Analytics
- GA4 → Real-Time
- Sentry → Issues (if configured)
- Browser DevTools → Console (no errors)

### 5.2 First Hour Checklist

- [ ] Error rate stable at baseline
- [ ] No spike in 404s or 500s
- [ ] Core Web Vitals within thresholds
- [ ] Analytics events flowing correctly
- [ ] No customer reports of issues

### 5.3 24-Hour Monitoring

Run these checks:

**After 6 hours:**
```bash
# Check analytics data
# Verify revenue parity with Shopify admin
# ±3% is acceptable, > 10% needs investigation
```

**After 24 hours:**
- [ ] Run full audit: `npm run pre-deploy`
- [ ] Compare analytics: GA4 vs Shopify Admin
- [ ] Review error logs
- [ ] Check Core Web Vitals trends
- [ ] Confirm checkout conversion rate stable

---

## Phase 6: Post-Deployment Actions

### 6.1 Unfreeze Main Branch

1. Go to GitHub: Settings → Branches → main
2. Disable "Lock branch"
3. Notify team: "✅ Main branch unfrozen"

### 6.2 Archive Reports

```bash
# Reports are auto-archived in releases/v1.0.0/
# Upload to internal wiki or SharePoint

# Generate final summary
cat releases/v1.0.0/RELEASE_NOTES_v1.0.0.md > deployment-summary.md
cat deployment-checklist-report.json >> deployment-summary.md
```

### 6.3 Send Deployment Summary

```
Subject: ✅ Production Deployment Complete - v1.0.0

Team,

Production deployment v1.0.0 completed successfully!

📊 Deployment Metrics:
- Duration: [X minutes]
- Tests Passed: 100%
- Error Rate: < 0.1%
- Performance: LCP [X]s, CLS [X]
- Downtime: 0 minutes

✅ Verification Complete:
- Smoke tests: PASSED
- Analytics: Flowing correctly
- Core paths: All functional
- Mobile: Responsive and performant

📈 Next Monitoring:
- 24-hour analytics review scheduled
- Core Web Vitals trending tracked
- Error monitoring active

🔗 Links:
- Release Notes: [URL]
- Audit Report: [URL]
- Performance: [Vercel Analytics URL]

Great work team! 🎉

[YOUR NAME]
```

### 6.4 Update Status Page (if applicable)

```
Deployment Complete ✅

All systems operational
Last updated: [TIMESTAMP]
```

---

## Emergency Rollback Procedure

If issues are detected, follow this procedure:

### When to Rollback

**Immediate rollback if:**
- Site completely down (500 errors)
- Checkout/payment broken
- Error rate > 10%
- Data corruption detected

**Investigate first if:**
- Minor UI issues
- Performance slightly degraded
- Single feature broken
- Analytics delayed

### Rollback Steps

```bash
# 1. Quick rollback (< 1 minute)
vercel rollback [previous-deployment-url]

# Or use emergency script
./scripts/emergency-rollback.sh

# 2. Verify rollback
curl -I https://store.labessentials.com
# Should return 200

# 3. Run smoke tests
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke

# 4. Notify stakeholders
# Post in Slack: "🚨 Emergency rollback executed due to [REASON]"
```

**Full procedure:** See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md)

---

## Deployment Checklist

Print and use this checklist for each deployment:

### Pre-Deployment
- [ ] Code freeze announced
- [ ] `npm run pre-deploy` passes
- [ ] Release notes generated
- [ ] Git tag created and pushed
- [ ] Branch protection enabled
- [ ] Environment backed up
- [ ] Team notified

### Deployment
- [ ] Final audit passed
- [ ] Deployment initiated
- [ ] Build completed successfully
- [ ] New deployment URL verified
- [ ] Health check passing

### Verification
- [ ] Smoke tests passed
- [ ] Homepage loads < 3s
- [ ] Add to cart works
- [ ] Checkout accessible
- [ ] Search functional
- [ ] Analytics firing
- [ ] Mobile responsive
- [ ] No console errors

### Monitoring
- [ ] Error rate < 1% (30 min)
- [ ] Core Web Vitals within thresholds
- [ ] Analytics flowing
- [ ] No customer complaints (1 hour)
- [ ] Revenue parity verified (24 hour)

### Post-Deployment
- [ ] Main branch unfrozen
- [ ] Reports archived
- [ ] Summary sent to team
- [ ] Status page updated
- [ ] Monitoring dashboards reviewed

---

## Troubleshooting Common Issues

### Issue: Build Fails

**Symptoms:** Vercel deployment fails during build

**Fix:**
```bash
# 1. Check build locally
npm run build

# 2. If it passes locally, check environment variables
vercel env ls

# 3. Ensure all required vars are set
npm run verify:env
```

### Issue: 500 Errors After Deploy

**Symptoms:** Site returns 500 status codes

**Action:** **IMMEDIATE ROLLBACK**
```bash
vercel rollback [previous-url]
```

Then investigate:
- Check Vercel function logs
- Review recent code changes
- Test locally with production env vars

### Issue: Analytics Not Tracking

**Symptoms:** No events in GA4 Real-Time

**Check:**
1. Browser DevTools → Network → Filter "analytics"
2. Verify GA4 ID in environment variables
3. Check Content Security Policy allows GA4
4. Test in incognito mode (no ad blockers)

**Fix:**
```bash
# Verify environment variable
vercel env get NEXT_PUBLIC_GA_MEASUREMENT_ID

# If missing, add it
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
# Redeploy
vercel --prod --force
```

### Issue: Slow Performance

**Symptoms:** LCP > 4s, Performance Score < 70

**Investigate:**
1. Run Lighthouse: `npx lighthouse [url] --view`
2. Check bundle size: `npm run audit:bundle`
3. Review image optimization
4. Check for blocking scripts

**Fix:**
- Optimize images (WebP/AVIF)
- Lazy load below-fold content
- Review and minimize third-party scripts
- Check CDN caching

---

## Contacts & Resources

### Emergency Contacts
- **On-Call Engineer:** [Contact]
- **DevOps Lead:** [Contact]
- **Product Owner:** [Contact]

### Resources
- **Runbook:** This document
- **Rollback:** [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md)
- **Observability:** [OBSERVABILITY_SETUP.md](./OBSERVABILITY_SETUP.md)
- **Audit Guide:** [DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md)

### URLs
- **Production:** https://store.labessentials.com
- **Vercel Dashboard:** https://vercel.com/[org]/lab-ess-headless
- **GitHub Actions:** https://github.com/[org]/lab-ess-headless/actions
- **GA4:** https://analytics.google.com/[property]
- **Status Page:** [URL if applicable]

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
**Next Review:** Quarterly
**Owner:** DevOps & Engineering Team

---

## Appendix: Automation Scripts

All scripts are located in `scripts/` directory:

| Script | Purpose | Usage |
|--------|---------|-------|
| `prepare-release.sh` | Prepare production release | `npm run release:prepare v1.0.0` |
| `pre-deploy-checklist.mjs` | Run deployment audit | `npm run pre-deploy` |
| `deployment-audit.mjs` | Comprehensive audit | `npm run audit:deployment` |
| `check-security.mjs` | Security scan | `npm run audit:security` |
| `check-bundle-size.mjs` | Bundle analysis | `npm run audit:bundle` |
| `validate-seo.mjs` | SEO validation | `npm run audit:seo` |
| `check-links.mjs` | Link checker | `npm run test:links` |
| `emergency-rollback.sh` | Fast rollback | `./scripts/emergency-rollback.sh` |

---

*This playbook is a living document. Update it after each deployment with lessons learned.*
