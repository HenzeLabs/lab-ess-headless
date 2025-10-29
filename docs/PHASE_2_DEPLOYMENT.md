# Phase 2 Production Deployment Guide

**Version:** 1.1.0 - Admin Dashboard & Analytics Integration
**Release Date:** October 29, 2025
**Estimated Time:** 30-45 minutes

---

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Add these variables to your production `.env` file:

```bash
# =================================================================
# PHASE 2: ADMIN DASHBOARD & ANALYTICS
# =================================================================

## Configuration Management API
CONFIG_ADMIN_TOKEN=<generate-with-crypto>
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

## Admin Dashboard
ADMIN_DASHBOARD_ENABLED=true

## GA4 Data API Integration
GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

## Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij
CLARITY_API_KEY=your-clarity-api-key

## AWS S3 Backups
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BACKUP_BUCKET=lab-essentials-config-backups

## Email Reports (Optional - for automated distribution)
SENDGRID_API_KEY=SG....
WEEKLY_REPORT_RECIPIENTS=engineering@lab-essentials.com,ops@lab-essentials.com

## Slack Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#ops-notifications
```

**Security Notes:**
- Store `CONFIG_ADMIN_TOKEN` in a password manager
- Use environment-specific secrets management (AWS Secrets Manager, Vercel Env Vars, etc.)
- Never commit credentials to git
- Rotate tokens quarterly

---

### 2. AWS S3 Bucket Setup

**Create S3 Bucket:**
```bash
aws s3 mb s3://lab-essentials-config-backups --region us-east-1
```

**Enable Versioning:**
```bash
aws s3api put-bucket-versioning \
  --bucket lab-essentials-config-backups \
  --versioning-configuration Status=Enabled
```

**Enable Server-Side Encryption:**
```bash
aws s3api put-bucket-encryption \
  --bucket lab-essentials-config-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**Set Lifecycle Policy (90-day retention):**

Create `lifecycle-policy.json`:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "backups/"
      },
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket lab-essentials-config-backups \
  --lifecycle-configuration file://lifecycle-policy.json
```

**Set Bucket Policy (restrict access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBackupServiceAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:user/lab-essentials-backup"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::lab-essentials-config-backups/*",
        "arn:aws:s3:::lab-essentials-config-backups"
      ]
    }
  ]
}
```

---

### 3. GA4 Service Account Setup

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: `lab-essentials-ga4-reader`
   - Grant role: `Viewer` (read-only)

2. **Create Key:**
   - Click on the service account
   - Go to Keys → Add Key → Create New Key
   - Choose JSON format
   - Save the file securely

3. **Add to GA4 Property:**
   - Go to [Google Analytics](https://analytics.google.com)
   - Admin → Property → Property Access Management
   - Add the service account email
   - Role: `Viewer`

4. **Get Property ID:**
   - Admin → Property Settings
   - Copy the Property ID (numbers only)

5. **Set Environment Variable:**
   ```bash
   # Copy the entire JSON file content
   GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

---

### 4. Microsoft Clarity Setup

1. **Create Clarity Project:**
   - Go to [Microsoft Clarity](https://clarity.microsoft.com)
   - Click "Add new project"
   - Name: "Lab Essentials"
   - Add website URL

2. **Get Project ID:**
   - Dashboard → Settings → Project ID
   - Copy the ID (e.g., `abcdefghij`)

3. **Get API Key (if available):**
   - Settings → API Access
   - Generate new API key
   - **Note:** Clarity API is limited; most features viewed via dashboard

4. **Install Tracking Code:**
   - Already integrated in app via `lib/clarity/events.ts`
   - Automatically loads when `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set

---

## Deployment Steps

### Step 1: Build and Test Locally

```bash
# Clean install dependencies
npm ci

# Run type check
npm run typecheck

# Run linter
npm run lint

# Build production bundle
npm run build

# Test locally
npm start
```

**Validation:**
- Navigate to `http://localhost:3000/admin/config`
- Verify table loads with 20 configurations
- Test category filtering (All, SEO, Security)
- Test search functionality
- Click Edit on a config, verify modal opens
- Click History, verify drawer opens (may show "No history" if fresh)

### Step 2: Deploy to Production

**For Vercel:**
```bash
# Set environment variables in Vercel dashboard
vercel env add CONFIG_ADMIN_TOKEN production
vercel env add GA4_PROPERTY_ID production
vercel env add GA4_SERVICE_ACCOUNT_JSON production
vercel env add CLARITY_PROJECT_ID production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add S3_BACKUP_BUCKET production

# Deploy
vercel --prod
```

**For Other Platforms:**
- Upload `.env.production` with all variables
- Run `npm run build && npm start`
- Or use your platform's deployment process

### Step 3: Schedule Automated Tasks

**Cron Jobs (Linux/Mac):**

Edit crontab:
```bash
crontab -e
```

Add entries:
```cron
# Nightly backup at 2 AM (server timezone)
0 2 * * * cd /path/to/lab-ess-headless && npm run backup:s3 >> /var/log/config-backup.log 2>&1

# Weekly report every Monday at 9 AM
0 9 * * 1 cd /path/to/lab-ess-headless && npm run report:weekly >> /var/log/config-report.log 2>&1
```

**GitHub Actions (.github/workflows/scheduled-tasks.yml):**
```yaml
name: Scheduled Configuration Tasks

on:
  schedule:
    # Nightly backup at 2 AM UTC
    - cron: '0 2 * * *'
    # Weekly report every Monday 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch: # Allow manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 2 * * *'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: Run S3 Backup
        env:
          AWS_REGION: ${{ secrets.AWS_REGION }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          S3_BACKUP_BUCKET: ${{ secrets.S3_BACKUP_BUCKET }}
        run: npm run backup:s3

  weekly-report:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 9 * * 1'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: Generate Weekly Report
        run: npm run report:weekly
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: weekly-audit-report
          path: reports/WEEKLY_AUDIT_SUMMARY.md
```

**Vercel Cron (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

Then create API routes:
- `app/api/cron/backup/route.ts` → calls `performNightlyBackup()`
- `app/api/cron/weekly-report/route.ts` → calls report generation

---

## Post-Deployment Validation

### Manual Validation Cycle

**1. Test Configuration Edit:**
```bash
# Using admin token
curl -X PUT https://your-domain.com/api/config \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_TOKEN" \
  -d '{"key":"seo.siteName","value":"Lab Essentials Pro"}'
```

**Expected Result:**
- ✅ Configuration updates successfully
- ✅ Version increments (v1 → v2)
- ✅ GA4 event fires (check GA4 Realtime report)
- ✅ Clarity event tracked (check Clarity dashboard)

**2. Verify History:**
```bash
curl https://your-domain.com/api/config/history?key=seo.siteName
```

**Expected Result:**
```json
{
  "key": "seo.siteName",
  "current": {
    "key": "seo.siteName",
    "value": "Lab Essentials Pro",
    "version": "2",
    "updated_by": "admin",
    "updated_at": "2025-10-29T..."
  },
  "history": [
    {
      "value": "Lab Essentials",
      "version": 1,
      "updated_by": "system",
      "updated_at": "2025-10-29T..."
    }
  ]
}
```

**3. Check Weekly Report:**
```bash
npm run report:weekly
cat reports/WEEKLY_AUDIT_SUMMARY.md
```

**Expected Result:**
- Report shows 1 change in period
- Change attributed to correct user
- System health shows appropriate score

**4. Verify S3 Backup:**
```bash
aws s3 ls s3://lab-essentials-config-backups/backups/ --recursive
```

**Expected Result:**
- Latest backup file visible
- Filename format: `backups/YYYY-MM-DD-HHMMSS/config.csv`

**5. Test Bulk Actions:**
- Open `/admin/config`
- Select 3 configurations
- Click "Export CSV"
- Verify CSV downloads with 3 rows

**6. Test History Drawer:**
- Click "History" on `seo.siteName`
- Verify drawer shows version 1 → 2 change
- Click "Revert to this version" on v1
- Confirm revert works
- Check that version is now v3 with original value

---

## Monitoring & Alerts

### Health Checks

**1. Admin Dashboard Uptime:**
```bash
# Add to uptime monitor (e.g., Pingdom, UptimeRobot)
curl -I https://your-domain.com/admin/config
# Expected: 200 OK
```

**2. API Health:**
```bash
curl https://your-domain.com/api/config?key=seo.siteName
# Expected: {"key":"seo.siteName","value":"..."}
```

**3. Backup Status:**
```bash
# Check last backup timestamp
aws s3api head-object \
  --bucket lab-essentials-config-backups \
  --key backups/latest/config.csv \
  --query 'LastModified'
# Should be within last 24 hours
```

### Alerts to Configure

1. **Backup Failure:**
   - Alert if no backup in last 48 hours
   - Check S3 logs for errors

2. **API Errors:**
   - Monitor 500 errors on `/api/config/*`
   - Alert if error rate > 1%

3. **Admin Access:**
   - Alert on failed authentication attempts
   - Log all admin token usage

4. **Configuration Changes:**
   - Slack notification on any config change
   - Weekly summary email to leadership

---

## Rollback Procedures

### Rollback to Previous Version (via UI)

1. Open `/admin/config`
2. Click "History" on affected configuration
3. Select previous version
4. Click "Revert to this version"
5. Confirm action
6. Verify change in table

### Rollback from S3 Backup

```bash
# List recent backups
aws s3 ls s3://lab-essentials-config-backups/backups/ --recursive

# Download specific backup
aws s3 cp s3://lab-essentials-config-backups/backups/2025-10-28/config.csv \
  ./data/config_store/config.csv

# Or use programmatic restore
node -e "
const { restoreFromS3Backup } = require('./lib/backup/s3.ts');
restoreFromS3Backup('backups/2025-10-28/config.csv').then(console.log);
"
```

### Emergency Rollback (git)

```bash
# Find last known good commit
git log --oneline data/config_store/config.csv

# Restore from specific commit
git checkout <commit-hash> -- data/config_store/config.csv

# Commit the revert
git commit -m "Emergency rollback: restore config.csv from <commit-hash>"
git push origin main
```

---

## Troubleshooting

### Issue: Admin Dashboard Not Loading

**Symptoms:** 404 or blank page at `/admin/config`

**Solutions:**
1. Check `ADMIN_DASHBOARD_ENABLED=true` in environment
2. Verify Next.js build included admin routes
3. Check browser console for errors
4. Clear `.next` cache and rebuild

### Issue: History Shows "No History"

**Symptoms:** History drawer empty even after changes

**Solutions:**
1. Verify git is initialized: `git status`
2. Check git log has commits: `git log --oneline data/config_store/config.csv`
3. Ensure config file is tracked in git
4. If fresh repo, make a dummy edit to create history

### Issue: S3 Backup Fails

**Symptoms:** Error during `npm run backup:s3`

**Solutions:**
1. Verify AWS credentials are set
2. Check bucket exists: `aws s3 ls s3://lab-essentials-config-backups`
3. Verify IAM permissions (PutObject, GetObject, ListBucket)
4. Check AWS region matches bucket region
5. Review error logs for specific AWS error codes

### Issue: GA4 Events Not Tracking

**Symptoms:** No data in GA4 realtime report

**Solutions:**
1. Verify `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set (client-side)
2. Check browser console for gtag errors
3. Confirm GA4 Measurement ID is correct
4. Test with GA4 DebugView in Chrome
5. Allow 24-48 hours for data to appear in reports

### Issue: Bulk Delete Fails

**Symptoms:** Error toast after clicking "Delete Selected"

**Solutions:**
1. Check admin token is correct
2. Verify API endpoint is accessible
3. Check server logs for authentication errors
4. Ensure no protected keys are selected
5. Try deleting one item at a time to isolate issue

---

## Success Criteria

✅ **Deployment Complete When:**
- Admin dashboard loads at `/admin/config`
- All 20 configurations display correctly
- Edit modal opens and saves changes
- History drawer shows git commit history
- Bulk actions (select, export, delete) work
- Weekly report generates successfully
- S3 backup creates new file
- GA4 events appear in Realtime report
- Clarity session recordings capture admin activity

✅ **System Healthy When:**
- Zero TypeScript errors in production build
- Zero console errors in browser
- API responses under 500ms
- Daily backups appear in S3
- Weekly reports generate without errors
- Admin access logs show no failed authentication

---

## Support Contacts

**Technical Issues:**
- Engineering Team: engineering@lab-essentials.com
- On-Call: Use PagerDuty escalation

**Third-Party Services:**
- AWS Support: https://console.aws.amazon.com/support
- Google Cloud Support: https://cloud.google.com/support
- Vercel Support: https://vercel.com/support

**Documentation:**
- Phase 2 Quickstart: [docs/PHASE_2_QUICKSTART.md](./PHASE_2_QUICKSTART.md)
- Phase 2 Roadmap: [PHASE_2_KICKOFF.md](../PHASE_2_KICKOFF.md)
- Operations Guide: [docs/OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md)

---

**Deployment Checklist Complete!** 🚀

Print this guide and check off items as you complete them for a smooth Phase 2 production deployment.
