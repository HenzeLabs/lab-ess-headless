# Rollback Procedures

Emergency rollback guide for production incidents.

## Quick Rollback Commands

### Vercel (Recommended)

```bash
# 1. List recent deployments
vercel ls --prod

# 2. Identify the last stable deployment
# Copy the deployment URL

# 3. Rollback
vercel rollback [deployment-url]

# Example:
# vercel rollback https://lab-ess-headless-abc123.vercel.app
```

### Git Revert (Alternative)

```bash
# 1. Revert the last commit
git revert HEAD

# 2. Push to trigger redeploy
git push origin main

# 3. Verify deployment
curl -I https://store.labessentials.com
```

---

## Decision Tree: Should You Rollback?

```
┌─────────────────────────────────────┐
│ Is the site completely down?        │
│ (returning 500s, won't load)       │
└──────────┬──────────────────────────┘
           │
       YES │
           ▼
    ┌──────────────┐
    │ ROLLBACK NOW │
    └──────────────┘

       NO  │
           ▼
┌─────────────────────────────────────┐
│ Are checkout/payments failing?      │
│ (revenue impact)                    │
└──────────┬──────────────────────────┘
           │
       YES │
           ▼
    ┌──────────────┐
    │ ROLLBACK NOW │
    └──────────────┘

       NO  │
           ▼
┌─────────────────────────────────────┐
│ Is error rate > 10%?                │
│ (user experience severely impacted) │
└──────────┬──────────────────────────┘
           │
       YES │
           ▼
    ┌──────────────┐
    │ ROLLBACK NOW │
    └──────────────┘

       NO  │
           ▼
┌─────────────────────────────────────┐
│ Are Core Web Vitals > 2x threshold? │
│ (LCP > 5s, CLS > 0.2, INP > 400ms)  │
└──────────┬──────────────────────────┘
           │
       YES │
           ▼
   ┌────────────────────┐
   │ INVESTIGATE FIRST  │
   │ Rollback if needed │
   └────────────────────┘

       NO  │
           ▼
┌─────────────────────────────────────┐
│ Minor UI issues or warnings?        │
└─────────────────────────────────────┘
           │
       NO  │
           ▼
   ┌────────────────────┐
   │ MONITOR & FIX      │
   │ No rollback needed │
   └────────────────────┘
```

---

## Rollback Procedures by Platform

### 1. Vercel Rollback

#### Method A: Dashboard (Easiest)

1. Go to https://vercel.com/your-org/lab-ess-headless
2. Click "Deployments" tab
3. Find the last working deployment (before the issue)
4. Click the three dots menu → "Promote to Production"
5. Confirm the rollback

**Time:** ~2 minutes

#### Method B: CLI (Faster)

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Login
vercel login

# List deployments
vercel ls --prod

# Rollback to specific deployment
vercel rollback https://lab-ess-headless-[deployment-id].vercel.app

# Verify
curl -I https://store.labessentials.com
```

**Time:** ~1 minute

#### Method C: Instant Rollback Script

Create `scripts/emergency-rollback.sh`:

```bash
#!/bin/bash

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "================================"

# Get last 5 production deployments
echo "Fetching recent deployments..."
DEPLOYMENTS=$(vercel ls --prod --limit 5 | tail -n +2)

echo ""
echo "Recent Production Deployments:"
echo "$DEPLOYMENTS"
echo ""

# Get the second deployment (skip current, rollback to previous)
PREVIOUS=$(echo "$DEPLOYMENTS" | sed -n '2p' | awk '{print $2}')

if [ -z "$PREVIOUS" ]; then
  echo "❌ Could not find previous deployment"
  exit 1
fi

echo "Rolling back to: $PREVIOUS"
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  vercel rollback "$PREVIOUS"
  echo "✅ Rollback complete!"
  echo "Verify at: https://store.labessentials.com"
else
  echo "Rollback cancelled"
fi
```

Usage:
```bash
chmod +x scripts/emergency-rollback.sh
./scripts/emergency-rollback.sh
```

### 2. Git Revert Rollback

When Vercel CLI is unavailable or you need to roll back multiple commits:

```bash
# Create rollback branch
git checkout -b rollback-emergency

# Revert the problematic commits
git revert HEAD  # Revert last commit

# Or revert multiple commits
git revert HEAD~3..HEAD  # Revert last 3 commits

# Push to trigger deployment
git push origin rollback-emergency

# Create PR for review
gh pr create --title "Emergency Rollback" --body "Rolling back due to production issue"

# Or force push to main (ONLY IN EMERGENCY)
git checkout main
git reset --hard HEAD~1  # Go back 1 commit
git push --force origin main
```

⚠️ **Warning:** Force push to main should only be used in dire emergencies.

### 3. Feature Flag Rollback

If you're using feature flags (recommended):

```javascript
// src/lib/features.ts
export const features = {
  newCheckout: process.env.NEXT_PUBLIC_ENABLE_NEW_CHECKOUT === 'true',
  quizV2: process.env.NEXT_PUBLIC_ENABLE_QUIZ_V2 === 'true',
  // ... other features
};
```

Rollback via environment variables:

```bash
# Vercel
vercel env rm NEXT_PUBLIC_ENABLE_NEW_CHECKOUT production
vercel --prod --force  # Force redeploy

# Or temporarily disable
vercel env add NEXT_PUBLIC_ENABLE_NEW_CHECKOUT production
# Enter: false
vercel --prod --force
```

---

## Post-Rollback Checklist

After rolling back, complete these steps:

### Immediate (< 5 minutes)

- [ ] **Verify rollback succeeded**
  ```bash
  curl -I https://store.labessentials.com
  # Check response is 200
  ```

- [ ] **Check critical paths work**
  ```bash
  # Run smoke tests
  PRODUCTION_URL=https://store.labessentials.com npm run test:smoke
  ```

- [ ] **Notify stakeholders**
  - Post in #incidents Slack channel
  - Email: incidents@labessentials.com
  - Update status page if public-facing

### Within 30 minutes

- [ ] **Monitor key metrics**
  - Error rate should drop to baseline
  - Check Sentry dashboard
  - Verify GA4 events flowing
  - Check Vercel Analytics

- [ ] **Document the incident**
  Create incident report:
  ```markdown
  # Incident Report: [Date]

  ## Summary
  [Brief description of the issue]

  ## Timeline
  - [Time]: Issue detected
  - [Time]: Rollback initiated
  - [Time]: Rollback completed
  - [Time]: Verification complete

  ## Root Cause
  [What caused the issue]

  ## Impact
  - Duration: [X minutes]
  - Users affected: [Estimate]
  - Revenue impact: [If applicable]

  ## Resolution
  [How it was fixed]

  ## Prevention
  [What we'll do to prevent this]
  ```

- [ ] **Review what went wrong**
  - Check deployment logs
  - Review code changes
  - Identify root cause

### Within 24 hours

- [ ] **Conduct post-mortem**
  - Schedule team meeting
  - Review incident timeline
  - Identify improvements

- [ ] **Update runbooks**
  - Document new failure mode
  - Update rollback procedures if needed

- [ ] **Implement preventive measures**
  - Add tests for the issue
  - Update CI/CD checks
  - Add monitoring/alerts

---

## Backup & Recovery

### Environment Variables Backup

```bash
# Backup production environment variables
vercel env pull .env.production.backup

# Encrypt and store securely
gpg --symmetric --cipher-algo AES256 .env.production.backup

# Store in password manager or secure vault
```

### Database Backup (if applicable)

```bash
# Shopify data is managed by Shopify
# For custom databases:

# PostgreSQL
pg_dump -h [host] -U [user] -d [database] > backup-$(date +%Y%m%d).sql

# MongoDB
mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)

# Compress
tar -czf backup-$(date +%Y%m%d).tar.gz backup-$(date +%Y%m%d)/
```

### Webhook Configuration Backup

```bash
# Export Shopify webhooks
curl -X GET \
  "https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/webhooks.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ADMIN_ACCESS_TOKEN}" \
  > webhooks-backup.json
```

---

## Rollback Scenarios & Solutions

### Scenario 1: Broken Build

**Symptoms:**
- Vercel deployment fails
- Build errors in logs
- Site shows old version

**Rollback:**
```bash
# Fix the code issue
git revert [bad-commit-hash]
git push origin main

# Or use previous Vercel deployment
vercel rollback [previous-url]
```

**Prevention:**
- Ensure `npm run build` passes locally
- Enable branch protection with required status checks
- Run `npm run pre-deploy` before merging

### Scenario 2: Runtime Errors

**Symptoms:**
- Site loads but features break
- Console errors
- API failures

**Rollback:**
```bash
# Immediate: Vercel rollback
vercel rollback [last-stable-deployment]

# Then: Fix and redeploy
git revert HEAD
npm run pre-deploy
git push origin main
```

**Prevention:**
- Comprehensive E2E tests
- Staging environment testing
- Gradual rollouts with feature flags

### Scenario 3: Performance Degradation

**Symptoms:**
- LCP > 5s
- High bounce rate
- Slow page loads

**Rollback:**
```bash
# Check if rollback improves performance
vercel rollback [previous-url]

# Monitor Lighthouse scores
npm run lh
```

**Prevention:**
- Performance budgets in CI
- Lighthouse CI checks
- Real user monitoring (RUM)

### Scenario 4: Analytics Broken

**Symptoms:**
- No GA4 events
- Meta Pixel not firing
- Missing conversion data

**Rollback:**
```bash
# Quick fix: Disable analytics temporarily
vercel env add NEXT_PUBLIC_DISABLE_ANALYTICS production
# Enter: true

# Then investigate and fix
# Restore analytics after fix
vercel env rm NEXT_PUBLIC_DISABLE_ANALYTICS production
```

**Prevention:**
- Analytics tests in E2E suite
- Monitor event parity daily
- Staging environment validation

### Scenario 5: SEO Issues

**Symptoms:**
- Missing meta tags
- Broken canonical URLs
- Sitemap errors

**Rollback:**
```bash
# Usually not urgent, can fix forward
# But if causing de-indexing:
vercel rollback [previous-url]
```

**Prevention:**
- SEO validation in `npm run audit:seo`
- Structured data testing
- Search Console monitoring

---

## Communication Templates

### Slack Alert (Immediate)

```
🚨 PRODUCTION INCIDENT

Status: Investigating / Rollback Initiated / Resolved
Severity: Critical / High / Medium
Impact: [Brief description]

Current Actions:
- [What's being done now]

ETA: [Estimated resolution time]

Updates: This thread
```

### Email to Stakeholders

```
Subject: [RESOLVED/ONGOING] Production Incident - [Brief Description]

Team,

We experienced a production incident at [TIME] affecting [SCOPE].

Status: [Resolved/Ongoing]

Impact:
- Duration: [X minutes]
- Features affected: [List]
- Users impacted: [Estimate]

Resolution:
- Rollback completed at [TIME]
- Site verified operational at [TIME]

Root Cause:
[Brief explanation]

Next Steps:
- Post-mortem scheduled for [DATE/TIME]
- Preventive measures being implemented

For questions, contact: [POINT PERSON]

[YOUR NAME]
```

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|-------------|
| On-Call Engineer | [Phone/Slack] | 24/7 |
| Engineering Lead | [Email/Phone] | Business hours |
| DevOps | [Slack channel] | 24/7 |
| Vercel Support | support@vercel.com | 24/7 (Enterprise) |
| Shopify Support | partners@shopify.com | 24/7 |

---

## Testing Rollback Procedures

**Practice rollbacks quarterly:**

```bash
# 1. Deploy a test "bad" version
git checkout -b test-rollback
# Make a harmless but visible change
echo "TEST ROLLBACK" > public/test.txt
git add public/test.txt
git commit -m "Test rollback deployment"
git push origin test-rollback

# Deploy to preview
vercel

# 2. Practice rolling back
vercel rollback [previous-deployment]

# 3. Verify rollback worked
curl https://store.labessentials.com/test.txt
# Should 404 (file removed)

# 4. Document any issues with process
```

---

**Last Updated:** 2025-10-24
**Next Review:** 2026-01-24
**Owner:** DevOps Team
