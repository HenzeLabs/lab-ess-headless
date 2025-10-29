# Disaster Recovery Drill Guide

Complete guide for conducting disaster recovery drills to validate rollback procedures and ensure <60 second recovery time objective (RTO).

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Drill Schedule](#drill-schedule)
4. [Staging Environment Drill](#staging-environment-drill)
5. [Production Drill (Off-Peak)](#production-drill-off-peak)
6. [Validation Checklist](#validation-checklist)
7. [Troubleshooting](#troubleshooting)
8. [Post-Drill Review](#post-drill-review)

---

## Overview

### Purpose
Disaster recovery drills validate our ability to quickly rollback failed deployments and restore service within our 60-second RTO target.

### Objectives
- ✅ Validate rollback scripts and procedures
- ✅ Measure actual recovery time
- ✅ Train team on emergency procedures
- ✅ Identify gaps in documentation
- ✅ Test monitoring and alerting systems
- ✅ Build team confidence in rollback process

### Frequency
- **Staging Drills:** Monthly (recommended)
- **Production Drills:** Quarterly (minimum)
- **Ad-hoc Drills:** After major infrastructure changes

### Success Criteria
- Rollback completes in <60 seconds
- Application fully functional post-rollback
- No data loss or corruption
- Team confident in procedures
- Documentation accurate and complete

---

## Prerequisites

### Required Access
- [ ] Git repository (read/write)
- [ ] Vercel account with deployment permissions
- [ ] Terminal/command line access
- [ ] Slack/communication channels
- [ ] Monitoring dashboards (Sentry, Vercel Analytics)

### Required Knowledge
- Basic git operations
- Vercel CLI usage
- Bash script execution
- Application architecture understanding

### Required Tools
```bash
# Verify tools are installed
which git      # Should return: /usr/bin/git
which vercel   # Should return: /usr/local/bin/vercel
which curl     # Should return: /usr/bin/curl
which jq       # Optional but recommended

# Verify permissions
ls -la scripts/emergency-rollback.sh
# Should show: -rwxr-xr-x (executable)
```

### Communication Setup
```markdown
**Pre-Drill Announcement (24h before):**

📢 Disaster Recovery Drill Scheduled

**When:** [DATE] at [TIME] UTC
**Where:** [Staging/Production] environment
**Duration:** ~15 minutes
**Impact:** None expected (rollback to current version)

**What to expect:**
- Brief deployment of test change
- Immediate rollback to current version
- Post-drill validation

**Who needs to be available:**
- [Name 1] - Lead
- [Name 2] - Observer
- [Name 3] - Timer/Logger

**Questions?** Reply in thread.
```

---

## Staging Environment Drill

### Step 1: Pre-Drill Setup (5 minutes)

```bash
# 1. Navigate to project directory
cd /path/to/lab-ess-headless

# 2. Verify current branch and status
git status
git branch --show-current  # Should be: main

# 3. Note current deployment
vercel ls --prod
# Record current deployment URL and timestamp

# 4. Verify staging environment exists
vercel ls
# Look for staging deployments

# 5. Create test branch
git checkout -b drill/rollback-test-$(date +%Y%m%d)
```

### Step 2: Deploy Test Change (2 minutes)

```bash
# 1. Make a visible but harmless change
echo "<!-- Rollback Drill: $(date -u +%Y-%m-%dT%H:%M:%SZ) -->" >> src/app/layout.tsx

# 2. Commit the change
git add src/app/layout.tsx
git commit -m "drill: rollback test $(date +%Y%m%d)"

# 3. Deploy to staging (NOT production)
vercel deploy --force

# 4. Wait for deployment to complete
# Note the deployment URL
```

### Step 3: Execute Rollback (Target: <60s)

**Start Timer Here** ⏱️

```bash
# Method 1: Using Emergency Rollback Script (Recommended)
./scripts/emergency-rollback.sh

# Follow the interactive prompts:
# 1. Review the list of recent deployments
# 2. Select the deployment BEFORE your test deployment
# 3. Confirm rollback when prompted
# 4. Wait for completion message

# The script will:
# - Show color-coded deployment list
# - Highlight current deployment
# - Prompt for selection (enter number)
# - Confirm before executing
# - Log the rollback event
```

**Stop Timer Here** ⏹️

### Step 4: Verify Rollback (3 minutes)

```bash
# 1. Check deployment list
vercel ls

# 2. Verify correct deployment is active
curl -I https://[staging-url].vercel.app | grep -i "x-vercel"

# 3. Check application functionality
# Open browser to staging URL and test:
# - Homepage loads
# - Collections page loads
# - Product page loads
# - Cart functionality
# - Search works

# 4. Verify test comment is gone
curl https://[staging-url].vercel.app | grep "Rollback Drill"
# Should return nothing (comment removed)
```

### Step 5: Cleanup

```bash
# 1. Return to main branch
git checkout main

# 2. Delete test branch
git branch -D drill/rollback-test-$(date +%Y%m%d)

# 3. Verify staging is stable
# Check monitoring dashboards for any errors
```

### Step 6: Document Results

```bash
# Edit ROLLBACK_LOG.md
nano ROLLBACK_LOG.md

# Fill in the drill template with:
# - Date and time
# - Environment (Staging)
# - Your name
# - Method used
# - Start/end times
# - Total duration
# - Whether <60s target was met
# - Any issues encountered
# - Lessons learned

# Commit the log
git add ROLLBACK_LOG.md
git commit -m "docs: disaster recovery drill results $(date +%Y%m%d)"
git push origin main
```

---

## Production Drill (Off-Peak)

### ⚠️ Important Considerations

**Before running a production drill:**
- Schedule during off-peak hours (e.g., Sunday 2-4 AM UTC)
- Notify all stakeholders 24-48 hours in advance
- Have full team available (engineering, support, product)
- Ensure monitoring systems are active
- Prepare customer communication templates (just in case)
- Verify backup/restore procedures
- Have emergency contacts ready

### Recommended Approach

For production drills, **use the same deployment as target**:
- Deploy current production version again
- Immediately roll back to the same version
- This creates zero user impact while testing mechanics

### Alternative: Blue-Green Simulation

```bash
# 1. Note current production deployment
CURRENT_URL=$(vercel ls --prod | grep "PRODUCTION" | awk '{print $1}')

# 2. Create new deployment (same code)
vercel deploy --prod

# 3. Wait for new deployment to be active (~30s)

# 4. Immediately rollback to previous
./scripts/emergency-rollback.sh
# Select the CURRENT_URL from list

# Result: Brief switch between identical deployments
# Impact: None (same code)
# Validation: Full rollback procedure tested
```

### Production Drill Validation

```bash
# Run comprehensive smoke tests
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke

# Check monitoring dashboards
# - Sentry: Error rate should be stable
# - Vercel Analytics: Traffic should be normal
# - GA4: Events should be tracking

# Verify Core Web Vitals
npx lighthouse https://store.labessentials.com \
  --only-categories=performance \
  --preset=desktop \
  --quiet
```

---

## Validation Checklist

### During Rollback

- [ ] Timer started at rollback initiation
- [ ] Deployment list retrieved successfully
- [ ] Correct deployment selected
- [ ] Confirmation prompt appeared
- [ ] Rollback command executed without errors
- [ ] Timer stopped when deployment active
- [ ] Total time <60 seconds
- [ ] Rollback logged automatically

### Post-Rollback

- [ ] Application homepage loads (200 status)
- [ ] Collections page functional
- [ ] Product pages loading correctly
- [ ] Cart operations working
- [ ] Checkout flow operational
- [ ] Search functionality intact
- [ ] Analytics tracking (GA4 events firing)
- [ ] No console errors in browser
- [ ] No error spike in Sentry
- [ ] Core Web Vitals within thresholds

### Monitoring Systems

- [ ] Vercel dashboard shows correct deployment
- [ ] Sentry error rate is normal
- [ ] GA4 real-time showing traffic
- [ ] Uptime monitoring green (if configured)
- [ ] No customer support tickets generated
- [ ] Team notified of completion

---

## Troubleshooting

### Issue: Rollback takes >60 seconds

**Possible Causes:**
- Vercel API latency
- Network connectivity issues
- Large deployment size
- Cold start times

**Solutions:**
1. Run drill during off-peak hours
2. Pre-warm target deployment: `curl [deployment-url]`
3. Use Vercel CLI aliases for faster selection
4. Consider instant rollback in Vercel dashboard

### Issue: Application not functional after rollback

**Possible Causes:**
- Environment variables changed
- Database migrations not reversed
- Cache not cleared
- CDN propagation delay

**Solutions:**
1. Verify environment variables match: `vercel env ls`
2. Check Vercel logs: `vercel logs`
3. Clear CDN cache if applicable
4. Wait 2-3 minutes for DNS/CDN propagation

### Issue: Can't find target deployment

**Possible Causes:**
- Deployment aged out (>30 days)
- Deployment deleted manually
- Incorrect project selected

**Solutions:**
1. Check deployment retention: `vercel ls --prod`
2. Verify project: `vercel whoami`
3. Use git tags to identify stable commits
4. Redeploy from known stable commit if needed

### Issue: Emergency script fails

**Possible Causes:**
- Missing executable permissions
- Vercel CLI not authenticated
- jq/curl not installed

**Solutions:**
```bash
# Fix permissions
chmod +x scripts/emergency-rollback.sh

# Authenticate Vercel CLI
vercel login

# Install missing dependencies (macOS)
brew install jq curl

# Install missing dependencies (Ubuntu)
sudo apt-get install jq curl
```

---

## Post-Drill Review

### Immediate Actions (Within 1 hour)

1. **Document Results** in [ROLLBACK_LOG.md](./ROLLBACK_LOG.md)
   ```markdown
   - Date/time
   - Duration
   - Issues encountered
   - Lessons learned
   ```

2. **Share Results** with team
   ```markdown
   ✅ Rollback Drill Complete

   **Duration:** XXs (Target: 60s)
   **Environment:** Staging
   **Status:** Success/Needs Improvement

   **Key Findings:**
   - [Finding 1]
   - [Finding 2]

   **Action Items:**
   - [ ] [Action 1] - @assignee
   - [ ] [Action 2] - @assignee
   ```

3. **Update Procedures** if gaps found
   - Fix documentation errors
   - Update scripts
   - Add missing steps

### Follow-up Actions (Within 1 week)

- [ ] Review drill results in team meeting
- [ ] Complete action items from drill
- [ ] Update runbooks/procedures
- [ ] Schedule next drill
- [ ] Consider automation improvements

### Metrics to Track

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Rollback Time | <60s | __s | |
| Detection Time | <2min | __min | From issue to decision |
| Communication Time | <1min | __min | Team notification |
| Verification Time | <3min | __min | Post-rollback checks |
| Total MTTR | <5min | __min | Mean time to recovery |

### Improvement Opportunities

**Questions to ask:**
- What went well?
- What was confusing?
- What took longer than expected?
- What documentation was missing?
- What would help next time?
- Should we automate anything?

**Common Improvements:**
- Pre-stage deployment URLs in runbook
- Add more detailed verification steps
- Automate smoke tests in rollback script
- Create dashboard for quick status checks
- Set up automatic Slack notifications

---

## Drill Scenarios

### Scenario 1: Basic Rollback (Beginner)
**Setup:** Deploy test comment, rollback immediately
**Duration:** 10 minutes
**Skills:** Basic rollback execution

### Scenario 2: Timed Challenge (Intermediate)
**Setup:** Deploy breaking change, rollback under pressure
**Duration:** 15 minutes
**Skills:** Speed, verification, communication

### Scenario 3: Weekend Emergency (Advanced)
**Setup:** Simulate production issue at 3 AM
**Duration:** 20 minutes
**Skills:** Decision-making, documentation, post-mortem

### Scenario 4: Multi-Issue (Expert)
**Setup:** Rollback + environment variable issue
**Duration:** 30 minutes
**Skills:** Troubleshooting, coordination, crisis management

---

## Emergency Rollback Decision Tree

```
                    Is production broken?
                           /    \
                        Yes      No → Monitor (no rollback)
                         |
                  How severe?
                    /     \
              Critical    Minor
                 |          |
           Rollback NOW   Can we fix forward?
                               /    \
                             Yes     No
                              |       |
                         Deploy Fix  Rollback
```

**Critical Severity Indicators:**
- Error rate >5%
- Revenue tracking broken
- Checkout flow failing
- Site completely down
- Security breach

**Minor Severity Indicators:**
- Visual bugs
- Non-critical feature broken
- Performance degradation <20%
- Console warnings

---

## Quick Reference

### Emergency Rollback (One Command)

```bash
./scripts/emergency-rollback.sh
```

### Manual Rollback (Vercel CLI)

```bash
# List deployments
vercel ls --prod

# Rollback to specific deployment
vercel rollback [deployment-url] --prod
```

### Validation (One Command)

```bash
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke
```

---

## Resources

- [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) - Complete rollback procedures
- [ROLLBACK_LOG.md](./ROLLBACK_LOG.md) - Historical log
- [emergency-rollback.sh](./scripts/emergency-rollback.sh) - Automated script
- [DEPLOYMENT_PLAYBOOK.md](./DEPLOYMENT_PLAYBOOK.md) - Full deployment guide
- [Vercel Rollback Docs](https://vercel.com/docs/deployments/rollbacks)

---

## Contact

**Questions or issues during drills?**
- Slack: #deployments
- Email: devops@labessentials.com
- On-call: [rotation link]

---

**Last Updated:** 2024-10-24
**Next Review:** 2025-01-24
