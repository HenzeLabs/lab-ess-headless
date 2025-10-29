# 🚀 Lab Essentials - Quick Command Reference

**For:** Lauren Henze (laurenh@lwscientific.com)
**Quick access to common commands for production operations**

---

## 🔍 Verification Commands

### Check Deployment Status
```bash
# Check if dashboards are live
curl -I https://labessentials.com/admin/config        # Should return HTTP 200
curl -I https://labessentials.com/admin/metrics       # Should return HTTP 200

# Check API health
curl https://labessentials.com/api/config?all=true | jq . | head -20
```

### Check Environment Variables (Server)
```bash
# Check if key variables are set
echo $CONFIG_ADMIN_TOKEN
echo $GA4_PROPERTY_ID
echo $S3_BACKUP_BUCKET
echo $SENDGRID_API_KEY
```

---

## 📊 Dashboard Access

### Open Dashboards
```bash
# Admin Configuration Dashboard
https://labessentials.com/admin/config

# Metrics & Analytics Dashboard
https://labessentials.com/admin/metrics
```

---

## 💾 Backup Commands

### Manual Backup
```bash
# Run backup immediately
npm run backup:s3

# Check backup logs
tail -f logs/backup.log

# List backups in S3
aws s3 ls s3://lab-essentials-config-backups/

# Download specific backup
aws s3 cp s3://lab-essentials-config-backups/config_2025-10-29_123456.csv ./
```

### Backup Troubleshooting
```bash
# Test S3 access
aws s3 ls

# Check S3 bucket exists
aws s3 ls | grep lab-essentials-config-backups

# Verify IAM permissions
aws iam get-user-policy --user-name lab-essentials-backup-bot --policy-name S3BackupAccess
```

---

## 📧 Email Report Commands

### Manual Report Generation & Send
```bash
# Generate weekly report
npm run report:weekly

# View generated report
cat reports/WEEKLY_AUDIT_SUMMARY.md
less reports/WEEKLY_AUDIT_SUMMARY.md

# Send email
./scripts/send-weekly-email.sh

# Check email logs
tail -f logs/email.log
```

### Email Troubleshooting
```bash
# Test SendGrid API key
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"laurenh@lwscientific.com"}]}],"from":{"email":"noreply@labessentials.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test email"}]}'

# Expected: HTTP 202 (success)
```

---

## ⏰ Cron Job Management

### View Scheduled Jobs
```bash
# List all cron jobs
crontab -l

# View Lab Essentials cron jobs only
crontab -l | grep -A 2 "Lab Essentials"
```

### Install/Update Cron Jobs
```bash
# Run automated setup
cd /var/www/lab-ess-headless
sudo ./scripts/setup-production-cron.sh

# Or manually edit
crontab -e
```

### Monitor Cron Execution
```bash
# Ubuntu/Debian
grep CRON /var/log/syslog | tail -20

# CentOS/RHEL
grep CRON /var/log/cron | tail -20

# Watch logs in real-time
tail -f logs/backup.log
tail -f logs/email.log
```

### Cron Schedule Reference
```
Nightly Backup:   0 2 * * *   (Every day at 2:00 AM)
Weekly Email:     0 9 * * 1   (Every Monday at 9:00 AM)
```

---

## 🔧 Configuration Management

### Read Configuration
```bash
# Get single config
curl https://labessentials.com/api/config?key=seo.siteName

# Get all SEO configs
curl https://labessentials.com/api/config?prefix=seo | jq .

# Get all configs
curl https://labessentials.com/api/config?all=true | jq .
```

### Update Configuration (Requires Auth)
```bash
# Set CONFIG_ADMIN_TOKEN first
export CONFIG_ADMIN_TOKEN="your-token-here"

# Update config
curl -X PUT https://labessentials.com/api/config \
  -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "seo.siteName",
    "value": "Lab Essentials - Your Science Partner",
    "updated_by": "admin"
  }'
```

### View History
```bash
# Get version history for a config
curl https://labessentials.com/api/config/history?key=seo.siteName | jq .

# View git commits for config file
git log --oneline data/config_store/config.csv

# View detailed diff
git log -p data/config_store/config.csv
```

---

## 📈 Metrics & Analytics

### Fetch GA4 Metrics
```bash
# Get last 7 days
curl "https://labessentials.com/api/metrics/ga4?start=2025-10-22&end=2025-10-29" | jq .

# Get last 30 days
curl "https://labessentials.com/api/metrics/ga4?start=$(date -d '30 days ago' +%Y-%m-%d)&end=$(date +%Y-%m-%d)" | jq .
```

### Fetch Clarity Metrics
```bash
# Get behavior metrics
curl "https://labessentials.com/api/metrics/clarity?start=2025-10-22&end=2025-10-29" | jq .
```

### Measure Config Impact
```bash
# Get impact of most recent config change
curl https://labessentials.com/api/metrics/impact | jq .

# Get impact of specific config
curl "https://labessentials.com/api/metrics/impact?key=seo.siteName" | jq .
```

---

## 🐛 Debugging & Logs

### View Application Logs
```bash
# Backup logs
tail -50 logs/backup.log
grep ERROR logs/backup.log

# Email logs
tail -50 logs/email.log
grep ERROR logs/email.log

# Follow logs in real-time
tail -f logs/backup.log
tail -f logs/email.log
```

### Check System Health
```bash
# Run health check script
./scripts/monitor-health.sh

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node

# Check port 3000 (if using PM2)
netstat -tulpn | grep 3000
```

### View Deployment Logs (Vercel)
```bash
# Via CLI
vercel logs

# Or visit dashboard
https://vercel.com/your-project/deployments
```

---

## 🔄 Git Operations

### View Recent Changes
```bash
# Last 10 commits
git log --oneline -10

# Changes to config file
git log --oneline data/config_store/config.csv

# View specific commit
git show abc1234
```

### Rollback Configuration
```bash
# Find commit hash of working state
git log --oneline data/config_store/config.csv

# Revert to specific version (via dashboard)
# Go to /admin/config → Click History → Click Revert

# Or revert via git (manual)
git revert abc1234
git push origin main
```

---

## 🧪 Testing Commands

### Test All Endpoints
```bash
# Create test script
cat > test-endpoints.sh << 'EOF'
#!/bin/bash
DOMAIN="https://labessentials.com"

echo "Testing Admin Dashboard..."
curl -I $DOMAIN/admin/config | head -1

echo "Testing Metrics Dashboard..."
curl -I $DOMAIN/admin/metrics | head -1

echo "Testing Config API..."
curl -I $DOMAIN/api/config?all=true | head -1

echo "Testing GA4 Metrics..."
curl -I "$DOMAIN/api/metrics/ga4?start=2025-10-22&end=2025-10-29" | head -1

echo "Testing Clarity Metrics..."
curl -I "$DOMAIN/api/metrics/clarity?start=2025-10-22&end=2025-10-29" | head -1

echo "Testing Config Impact..."
curl -I $DOMAIN/api/metrics/impact | head -1

echo "All tests complete!"
EOF

chmod +x test-endpoints.sh
./test-endpoints.sh
```

### Load Testing
```bash
# Simple load test with Apache Bench
ab -n 100 -c 10 https://labessentials.com/admin/config

# Or use curl in a loop
for i in {1..50}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://labessentials.com/admin/config
done
```

---

## 🔐 Security Operations

### Rotate Admin Token
```bash
# Generate new token
NEW_TOKEN=$(openssl rand -base64 32)
echo "New CONFIG_ADMIN_TOKEN: $NEW_TOKEN"

# Update in Vercel dashboard:
# Settings → Environment Variables → CONFIG_ADMIN_TOKEN → Edit → Save

# Redeploy
vercel --prod
```

### Check Security Headers
```bash
curl -I https://labessentials.com/admin/config | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"
```

### Audit AWS IAM Permissions
```bash
# List IAM user policies
aws iam list-user-policies --user-name lab-essentials-backup-bot

# Get policy details
aws iam get-user-policy --user-name lab-essentials-backup-bot --policy-name S3BackupAccess
```

---

## 📦 Maintenance Commands

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all packages (careful!)
npm update

# Update specific package
npm update next@latest

# Rebuild after updates
npm run build
npm run typecheck
```

### Clean Up Old Backups
```bash
# List all backups sorted by date
aws s3 ls s3://lab-essentials-config-backups/ --recursive | sort

# Delete backups older than 90 days (done automatically by lifecycle policy)
# Manual delete if needed:
aws s3 rm s3://lab-essentials-config-backups/config_2024-07-01_123456.csv
```

### Archive Old Reports
```bash
# Move old reports to archive
mkdir -p reports/archive/2025-Q3
mv reports/WEEKLY_AUDIT_SUMMARY_2025-07-*.md reports/archive/2025-Q3/

# Or compress
tar -czf reports/archive/reports-2025-Q3.tar.gz reports/WEEKLY_AUDIT_SUMMARY_2025-07-*.md
```

---

## 🆘 Emergency Procedures

### Dashboard Down
```bash
# Check deployment status
curl -I https://labessentials.com/admin/config

# Check Vercel logs
vercel logs --follow

# Redeploy
git push origin main --force-with-lease
vercel --prod
```

### Backup Failure
```bash
# Check last successful backup
aws s3 ls s3://lab-essentials-config-backups/ | tail -5

# Manual backup now
npm run backup:s3

# If S3 unavailable, local backup:
cp data/config_store/config.csv backups/config_$(date +%Y%m%d_%H%M%S).csv
```

### Email Not Sending
```bash
# Check SendGrid status
curl https://status.sendgrid.com/api/v2/status.json

# Test API key
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"laurenh@lwscientific.com"}]}],"from":{"email":"noreply@labessentials.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'

# Check logs
tail -50 logs/email.log
```

### Rollback Deployment
```bash
# Find last working commit
git log --oneline -10

# Rollback code
git reset --hard abc1234
git push origin main --force

# Redeploy
vercel --prod
```

---

## 📞 Support Contacts

**Primary Contact:**
- Lauren Henze
- Email: laurenh@lwscientific.com

**Documentation:**
- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Deployment Verification](DEPLOYMENT_VERIFICATION.md)
- [Production Ready Checklist](PRODUCTION_READY.md)
- [Operations Guide](docs/OPERATIONS_GUIDE.md)

**GitHub:**
- Repository: https://github.com/HenzeLabs/lab-ess-headless
- Issues: https://github.com/HenzeLabs/lab-ess-headless/issues

---

## 💡 Helpful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Lab Essentials aliases
alias lab-cd='cd /var/www/lab-ess-headless'
alias lab-backup='cd /var/www/lab-ess-headless && npm run backup:s3'
alias lab-email='cd /var/www/lab-ess-headless && ./scripts/send-weekly-email.sh'
alias lab-logs='cd /var/www/lab-ess-headless && tail -f logs/*.log'
alias lab-health='cd /var/www/lab-ess-headless && ./scripts/monitor-health.sh'
alias lab-config='curl -s https://labessentials.com/api/config?all=true | jq .'
alias lab-metrics='curl -s "https://labessentials.com/api/metrics/ga4?start=$(date -d "7 days ago" +%Y-%m-%d)&end=$(date +%Y-%m-%d)" | jq .'

# Then reload: source ~/.bashrc
```

---

**Last Updated:** October 29, 2025
**Version:** 1.1 (Phase 2 - Admin Dashboard & Analytics)
