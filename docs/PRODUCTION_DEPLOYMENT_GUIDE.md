# Lab Essentials Phase 2 - Production Deployment Guide

**Version:** 1.1 (Admin Dashboard & Analytics Integration)
**Date:** October 29, 2025
**Deployed to:** main branch
**Deployment Contact:** laurenh@lwscientific.com

---

## 🚀 Deployment Status

✅ **Main Branch Updated:** Phase 2 merged and pushed to origin/main
✅ **Build Tested:** Production build passes with 0 TypeScript errors
✅ **Features Complete:**
- Admin Dashboard (/admin/config)
- Metrics Dashboard (/admin/metrics)
- GA4 Integration
- Microsoft Clarity Integration
- S3 Automated Backups
- Weekly Audit Reports

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Add these to your production environment (Vercel, Netlify, or your hosting provider):

```bash
# ============================================
# CONFIGURATION MANAGEMENT API
# ============================================
CONFIG_ADMIN_TOKEN=<generate-secure-32-char-token>
# Generate with: openssl rand -base64 32

# ============================================
# GOOGLE ANALYTICS 4 DATA API
# ============================================
GA4_PROPERTY_ID=123456789
# Find in: https://analytics.google.com/ → Admin → Property Settings → Property ID

GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'
# Complete service account JSON from Google Cloud Console
# See section 2 below for full setup instructions

# ============================================
# MICROSOFT CLARITY
# ============================================
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij
# Find in: https://clarity.microsoft.com/ → Settings → Project ID

CLARITY_API_KEY=your-api-key-here
# Find in: https://clarity.microsoft.com/ → Settings → API → Generate Key

# ============================================
# AWS S3 AUTOMATED BACKUPS
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BACKUP_BUCKET=lab-essentials-config-backups

# Create bucket with:
# - Versioning enabled
# - Server-side encryption (AES-256)
# - Lifecycle policy: Delete objects after 90 days
# - Private access only
```

---

## 2. GA4 Service Account Setup (15 minutes)

### Step 1: Create Service Account in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one: "lab-essentials-analytics")
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **+ CREATE SERVICE ACCOUNT**
5. Fill in:
   - Name: `ga4-lab-essentials-reader`
   - Description: `Read-only access to GA4 data for Lab Essentials dashboard`
6. Click **CREATE AND CONTINUE**
7. Grant role: **Viewer** (or custom role with analytics.readonly)
8. Click **DONE**

### Step 2: Create JSON Key

1. Click on the newly created service account
2. Go to **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Select **JSON** format
5. Click **CREATE** (file downloads automatically)
6. Copy entire JSON content (will be used in env var)

### Step 3: Enable Google Analytics Data API

1. In Google Cloud Console, navigate to **APIs & Services** → **Library**
2. Search for "Google Analytics Data API"
3. Click **Google Analytics Data API**
4. Click **ENABLE**

### Step 4: Grant Service Account Access to GA4

1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Admin** (bottom left gear icon)
3. In the **Property** column, click **Property Access Management**
4. Click **+** (Add users)
5. Enter the service account email (e.g., `ga4-lab-essentials-reader@your-project.iam.gserviceaccount.com`)
6. Select **Viewer** role
7. Click **Add**

### Step 5: Get Property ID

1. Still in **Admin** → **Property Settings**
2. Copy the **Property ID** (numeric, e.g., `123456789`)
3. Set as `GA4_PROPERTY_ID` in your env

### Step 6: Add to Environment

```bash
export GA4_PROPERTY_ID=123456789
export GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"lab-essentials-analytics","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"ga4-lab-essentials-reader@lab-essentials-analytics.iam.gserviceaccount.com",...}'
```

**⚠️ Important:** Ensure the JSON is properly escaped for your environment. In Vercel/Netlify, paste the entire JSON as a single-line string.

---

## 3. Microsoft Clarity Setup (5 minutes)

### Step 1: Create Clarity Project

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with Microsoft account
3. Click **+ Add new project**
4. Fill in:
   - Name: `Lab Essentials Headless`
   - Website URL: `https://labessentials.com`
5. Click **Create**

### Step 2: Get Project ID

1. After creation, you'll see the project dashboard
2. Copy the **Project ID** from the URL or Settings page
   - Format: 10-character alphanumeric (e.g., `abcdefghij`)
3. Set as `NEXT_PUBLIC_CLARITY_PROJECT_ID`

### Step 3: Generate API Key

1. In Clarity project, go to **Settings** → **API**
2. Click **Generate API Key**
3. Copy the API key (format: long alphanumeric string)
4. Set as `CLARITY_API_KEY`

### Step 4: Install Tracking Code (Already Done)

The Clarity tracking script is already integrated in:
- [lib/clarity/events.ts](../lib/clarity/events.ts) - Initialization code
- Automatically loads when `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set

---

## 4. AWS S3 Backup Bucket Setup (10 minutes)

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://lab-essentials-config-backups --region us-east-1
```

Or via AWS Console:
1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Name: `lab-essentials-config-backups`
4. Region: `us-east-1` (or your preferred region)
5. **Block all public access**: ✅ Enabled
6. **Versioning**: ✅ Enabled
7. **Server-side encryption**: AES-256 (SSE-S3)
8. Click **Create bucket**

### Step 2: Configure Lifecycle Policy

1. In S3 Console, select your bucket
2. Go to **Management** tab → **Lifecycle rules**
3. Click **Create lifecycle rule**
4. Name: `delete-old-backups`
5. Rule scope: **Apply to all objects**
6. Actions: ✅ **Expire current versions of objects**
7. Days: `90`
8. Click **Create rule**

### Step 3: Create IAM User for Backups

```bash
aws iam create-user --user-name lab-essentials-backup-bot
```

### Step 4: Attach S3 Policy

Create policy file `s3-backup-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::lab-essentials-config-backups",
        "arn:aws:s3:::lab-essentials-config-backups/*"
      ]
    }
  ]
}
```

Attach policy:

```bash
aws iam put-user-policy --user-name lab-essentials-backup-bot \
  --policy-name S3BackupAccess \
  --policy-document file://s3-backup-policy.json
```

### Step 5: Generate Access Keys

```bash
aws iam create-access-key --user-name lab-essentials-backup-bot
```

Output:
```json
{
  "AccessKey": {
    "UserName": "lab-essentials-backup-bot",
    "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  }
}
```

Set in environment:

```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_REGION=us-east-1
export S3_BACKUP_BUCKET=lab-essentials-config-backups
```

---

## 5. Deploy to Production

### Option A: Vercel (Recommended)

1. **Connect Repository:**
   ```bash
   vercel --prod
   ```

2. **Add Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from section 1 above
   - Ensure they're set for **Production** environment

3. **Trigger Deployment:**
   ```bash
   git push origin main
   ```
   Vercel auto-deploys when main branch updates

4. **Verify:**
   ```bash
   curl -I https://your-domain.vercel.app/admin/config
   # Should return HTTP 200

   curl -I https://your-domain.vercel.app/admin/metrics
   # Should return HTTP 200
   ```

### Option B: Manual Server Deployment

1. **Clone repository:**
   ```bash
   cd /var/www
   git clone https://github.com/HenzeLabs/lab-ess-headless.git
   cd lab-ess-headless
   git checkout main
   ```

2. **Install dependencies:**
   ```bash
   npm ci --production
   ```

3. **Set environment variables:**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "lab-essentials" -- start
   pm2 save
   pm2 startup
   ```

---

## 6. Post-Deployment Verification (5 minutes)

### Test Admin Dashboard

```bash
# Replace with your production domain
DOMAIN="https://labessentials.com"

# Test config dashboard
curl -I $DOMAIN/admin/config
# Expected: HTTP 200

# Test metrics dashboard
curl -I $DOMAIN/admin/metrics
# Expected: HTTP 200

# Test API endpoints
curl -I "$DOMAIN/api/config?key=seo.siteName"
# Expected: HTTP 200

# Test GA4 metrics API
curl -I "$DOMAIN/api/metrics/ga4?start=2025-10-22&end=2025-10-29"
# Expected: HTTP 200 or 503 (if GA4 not configured)

# Test Clarity metrics API
curl -I "$DOMAIN/api/metrics/clarity?start=2025-10-22&end=2025-10-29"
# Expected: HTTP 200 or 503 (if Clarity not configured)
```

### Visual Verification

1. **Open Admin Dashboard:**
   - Navigate to `https://labessentials.com/admin/config`
   - Verify all configurations load
   - Test "Edit" button on one parameter
   - Confirm toast notification appears after save

2. **Open Metrics Dashboard:**
   - Navigate to `https://labessentials.com/admin/metrics`
   - Verify KPI cards display (may show demo data initially)
   - Check "Config Impact" widget
   - Check "Behavior Highlights" section
   - Verify charts render (Sessions & Conversion Funnel)

3. **Test Configuration Change:**
   - Edit one parameter (e.g., `seo.siteName`)
   - Save change
   - Check History drawer shows new version
   - Verify git commit was created:
     ```bash
     git log -1 --oneline data/config_store/config.csv
     ```

---

## 7. Schedule Automated Reports (10 minutes)

### Create Email Report Script

Create [scripts/send-weekly-email.sh](../scripts/send-weekly-email.sh):

```bash
#!/bin/bash

# Configuration
EMAIL_TO="laurenh@lwscientific.com"
EMAIL_FROM="noreply@labessentials.com"
REPORT_PATH="/var/www/lab-ess-headless/reports/WEEKLY_AUDIT_SUMMARY.md"

# Generate report
cd /var/www/lab-ess-headless
npm run report:weekly

# Convert Markdown to HTML
REPORT_HTML=$(node -e "
const fs = require('fs');
const md = fs.readFileSync('$REPORT_PATH', 'utf8');
// Simple markdown to HTML conversion
const html = md
  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
  .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
  .replace(/\`(.+?)\`/g, '<code>$1</code>')
  .replace(/^- (.+)$/gm, '<li>$1</li>')
  .replace(/(<li>.*<\\/li>\\n?)+/gs, '<ul>$&</ul>');
console.log(html);
")

# Send email using SendGrid API
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data "{
    \"personalizations\": [{
      \"to\": [{\"email\": \"$EMAIL_TO\"}]
    }],
    \"from\": {\"email\": \"$EMAIL_FROM\"},
    \"subject\": \"Lab Essentials Weekly Configuration Audit - $(date +'%Y-%m-%d')\",
    \"content\": [{
      \"type\": \"text/html\",
      \"value\": \"$REPORT_HTML\"
    }]
  }"
```

Make executable:

```bash
chmod +x scripts/send-weekly-email.sh
```

### Setup SendGrid (Alternative: Use AWS SES, Mailgun, etc.)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API key:
   - Settings → API Keys → Create API Key
   - Name: `lab-essentials-weekly-reports`
   - Permissions: **Mail Send** (Full Access)
3. Copy API key and add to environment:
   ```bash
   export SENDGRID_API_KEY=SG.xxx...
   ```

### Schedule Cron Job

Run the automated setup script:

```bash
cd /var/www/lab-ess-headless
sudo ./scripts/setup-cron.sh
```

Or manually add to crontab:

```bash
crontab -e
```

Add these lines:

```cron
# Nightly S3 backup at 2:00 AM
0 2 * * * cd /var/www/lab-ess-headless && npm run backup:s3 >> logs/backup.log 2>&1

# Weekly report + email every Monday at 9:00 AM
0 9 * * 1 cd /var/www/lab-ess-headless && npm run report:weekly && ./scripts/send-weekly-email.sh >> logs/report.log 2>&1
```

Save and verify:

```bash
crontab -l
```

### Alternative: GitHub Actions (Vercel/Cloud Deployments)

Create [.github/workflows/weekly-report.yml](../.github/workflows/weekly-report.yml):

```yaml
name: Weekly Configuration Audit Report

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Generate report
        run: npm run report:weekly

      - name: Send email via SendGrid
        env:
          SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
          EMAIL_TO: laurenh@lwscientific.com
        run: |
          REPORT_HTML=$(node -e "...")
          curl --request POST \
            --url https://api.sendgrid.com/v3/mail/send \
            --header "Authorization: Bearer $SENDGRID_API_KEY" \
            ...
```

---

## 8. Validate With Real Configuration Change (24-48 hours)

### Day 1: Make Test Change

1. Navigate to `/admin/config`
2. Edit `seo.siteName`:
   - Old: "Lab Essentials"
   - New: "Lab Essentials - Your Science Partner"
3. Click **Save**
4. Verify:
   - ✅ Toast notification appears
   - ✅ History drawer shows new version
   - ✅ Git commit created
   - ✅ S3 backup triggered (if scheduled)

### Day 2: Check Metrics Impact

1. Navigate to `/admin/metrics`
2. Look at **Config Impact Widget**
3. Should display:
   - Configuration key: `seo.siteName`
   - Changed date: Yesterday
   - Before metrics (7 days prior to change)
   - After metrics (7 days after change)
   - Percentage deltas for Page Views, Sessions, Bounce Rate
   - Automated recommendation

Example output:
```
📈 Impact Since Last Config Change

Measuring effect of seo.siteName
Changed Oct 29, 2025 • 7-day comparison

Page Views: +12.3%
Sessions: +8.7%
Bounce Rate: -2.1%

✅ Positive impact detected - configuration change improved metrics
```

---

## 9. Monitoring & Alerts

### Setup Error Monitoring

Add to your error tracking service (Sentry, Bugsnag, etc.):

```typescript
// src/app/layout.tsx or middleware
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Monitor Cron Jobs

Check logs regularly:

```bash
# View backup log
tail -f logs/backup.log

# View report log
tail -f logs/report.log
```

Setup log rotation:

```bash
sudo nano /etc/logrotate.d/lab-essentials
```

Add:

```
/var/www/lab-ess-headless/logs/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
}
```

---

## 10. Rollback Procedure

If issues occur, rollback to previous version:

### Rollback Application Code

```bash
# Find last working commit
git log --oneline -10

# Revert to previous commit (e.g., 1b3689b)
git reset --hard 1b3689b
git push origin main --force

# Redeploy
vercel --prod  # or your deployment command
```

### Rollback Configuration Change

1. Navigate to `/admin/config`
2. Click **History** button for affected parameter
3. Find previous version in drawer
4. Click **Revert to Version X**
5. Confirm revert

Or via API:

```bash
curl -X PUT https://labessentials.com/api/config \
  -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"seo.siteName","value":"Lab Essentials","updated_by":"admin"}'
```

---

## 11. Troubleshooting

### Issue: GA4 Metrics Not Loading

**Symptoms:** `/admin/metrics` shows "GA4 not configured" or errors

**Solutions:**
1. Verify environment variables:
   ```bash
   echo $GA4_PROPERTY_ID
   echo $GA4_SERVICE_ACCOUNT_JSON | jq .
   ```

2. Test API directly:
   ```bash
   curl https://labessentials.com/api/metrics/ga4?start=2025-10-22&end=2025-10-29
   ```

3. Check service account permissions in GA4:
   - Go to GA4 → Admin → Property Access Management
   - Ensure service account email has **Viewer** role

4. Verify API is enabled:
   - Google Cloud Console → APIs & Services → Dashboard
   - Search for "Google Analytics Data API"
   - Status should be **Enabled**

### Issue: Clarity Metrics Not Loading

**Symptoms:** Behavior Highlights section shows "Clarity data unavailable"

**Solutions:**
1. Verify `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set
2. Check Clarity dashboard shows recent sessions:
   - Go to https://clarity.microsoft.com/
   - Select your project
   - Should see sessions in last 7 days

3. Test API:
   ```bash
   curl https://labessentials.com/api/metrics/clarity?start=2025-10-22&end=2025-10-29
   ```

### Issue: S3 Backup Failing

**Symptoms:** Cron job fails, backup.log shows errors

**Solutions:**
1. Test AWS credentials:
   ```bash
   aws s3 ls s3://lab-essentials-config-backups
   ```

2. Check IAM permissions:
   ```bash
   aws iam get-user-policy --user-name lab-essentials-backup-bot --policy-name S3BackupAccess
   ```

3. Manual backup test:
   ```bash
   npm run backup:s3
   ```

4. Verify bucket exists and is accessible:
   ```bash
   aws s3 ls | grep lab-essentials-config-backups
   ```

### Issue: Weekly Email Not Sending

**Symptoms:** No email received on Monday morning

**Solutions:**
1. Check SendGrid API key is valid:
   ```bash
   curl --request POST \
     --url https://api.sendgrid.com/v3/mail/send \
     --header "Authorization: Bearer $SENDGRID_API_KEY" \
     --header 'Content-Type: application/json' \
     --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@labessentials.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```

2. Verify cron job is scheduled:
   ```bash
   crontab -l | grep weekly
   ```

3. Check report generation works:
   ```bash
   npm run report:weekly
   ls -l reports/WEEKLY_AUDIT_SUMMARY.md
   ```

4. Review cron logs:
   ```bash
   tail -50 logs/report.log
   ```

---

## 12. Security Checklist

- [ ] `CONFIG_ADMIN_TOKEN` is unique and not committed to git
- [ ] GA4 service account has read-only access (not admin)
- [ ] S3 bucket has public access blocked
- [ ] AWS IAM user has minimal permissions (only S3 write)
- [ ] Clarity API key is stored as environment variable
- [ ] Admin dashboard requires authentication in production
- [ ] CSP headers include GA4, Clarity, S3 domains

---

## 13. Performance Optimization

### Enable Caching

Add to [next.config.mjs](../next.config.mjs):

```javascript
export default {
  async headers() {
    return [
      {
        source: '/api/metrics/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

### Use CDN for Static Assets

Ensure Vercel/Netlify CDN is enabled for:
- `/admin/metrics` dashboard
- Recharts assets
- Public assets

---

## 14. Support & Maintenance

**Primary Contact:**
Lauren Henze
laurenh@lwscientific.com

**Documentation:**
- [Phase 2 Deployment Guide](PHASE_2_DEPLOYMENT.md)
- [Operations Guide](OPERATIONS_GUIDE.md)
- [Phase 2 Quickstart](PHASE_2_QUICKSTART.md)

**GitHub Repository:**
https://github.com/HenzeLabs/lab-ess-headless

**Issue Tracking:**
Report bugs and feature requests via GitHub Issues

---

## ✅ Deployment Complete!

Once all steps above are completed:

1. ✅ Main branch deployed to production
2. ✅ Environment variables configured
3. ✅ GA4 integration tested
4. ✅ Clarity integration tested
5. ✅ S3 backups scheduled
6. ✅ Weekly reports automated
7. ✅ Email notifications configured
8. ✅ Dashboards accessible and functional

**Next Steps:**
- Monitor logs for first 48 hours
- Review first weekly audit email on Monday
- Make test configuration change and measure impact
- Schedule quarterly review of analytics insights

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verification Sign-off:** _______________
