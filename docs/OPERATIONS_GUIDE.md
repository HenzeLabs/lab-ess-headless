# Configuration Management Operations Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-29
**Status:** Production Ready

---

## Table of Contents

1. [Production Deployment](#production-deployment)
2. [Daily Operations](#daily-operations)
3. [Security & Access Control](#security--access-control)
4. [Backup & Recovery](#backup--recovery)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Troubleshooting](#troubleshooting)
7. [Emergency Procedures](#emergency-procedures)

---

## Production Deployment

### Initial Deployment Checklist

**Before First Deploy:**

1. **Generate Secure Admin Token**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Store in environment variables (Vercel, AWS, etc.)

2. **Set Environment Variables**
   ```
   CONFIG_ADMIN_TOKEN=<generated-token>
   NODE_ENV=production
   ALLOWED_IPS=<optional-comma-separated-ips>
   ```

3. **Verify Configuration Store**
   ```bash
   node scripts/test-config-store.mjs
   ```
   Expected: 6/6 tests passing

4. **Run Build Validation**
   ```bash
   npm run typecheck
   npm run build
   ```
   Expected: No errors

5. **Deploy Application**
   ```bash
   git add .
   git commit -m "feat: add configuration management system v1.0"
   git tag v1.0-runtime-config
   git push origin main --tags
   ```

### Post-Deployment Verification

1. **Test Read Endpoints** (should work immediately)
   ```bash
   curl "https://yourdomain.com/api/config?key=seo.siteName"
   ```

2. **Test Write Protection** (should require auth)
   ```bash
   curl -X PUT "https://yourdomain.com/api/config" \
     -H "Content-Type: application/json" \
     -d '{"key":"test","value":"test"}'
   ```
   Expected: `{"error":"Unauthorized"}`

3. **Test Authenticated Write**
   ```bash
   curl -X PUT "https://yourdomain.com/api/config" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
     -d '{"key":"seo.siteName","value":"Lab Essentials","updated_by":"ops@example.com"}'
   ```
   Expected: `{"message":"Configuration updated successfully"}`

---

## Daily Operations

### Configuration Changes

**Standard Process:**

1. **Read Current Value**
   ```bash
   curl "https://yourdomain.com/api/config?key=<key>"
   ```

2. **Update Value**
   ```bash
   curl -X PUT "https://yourdomain.com/api/config" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
     -d '{"key":"<key>","value":"<new-value>","updated_by":"<your-email>"}'
   ```

3. **Verify Change**
   ```bash
   curl "https://yourdomain.com/api/config?key=<key>"
   ```

4. **Document in Change Log**
   - Record change in team communication channel
   - Note business reason for change
   - Monitor metrics for 24 hours

### Batch Updates

For multiple related changes:

```bash
curl -X POST "https://yourdomain.com/api/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
  -d '{
    "updates": [
      {"key":"key1","value":"value1"},
      {"key":"key2","value":"value2"}
    ],
    "updated_by":"ops@example.com"
  }'
```

### Rollback Process

**Option 1: API Update** (fastest)
```bash
curl -X PUT "https://yourdomain.com/api/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
  -d '{"key":"<key>","value":"<previous-value>","updated_by":"ops@example.com"}'
```

**Option 2: Git Revert** (for multiple values)
```bash
git checkout <previous-commit> -- data/config_store/config.csv
git add data/config_store/config.csv
git commit -m "rollback: revert config changes from <commit>"
git push
```

---

## Security & Access Control

### Token Management

**Generate New Token:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Rotate Token (Monthly Recommended):**

1. Generate new token
2. Update environment variables in production
3. Wait 5 minutes for deployment
4. Verify new token works
5. Invalidate old token
6. Notify team of token change

**Token Storage Best Practices:**
- ✅ Store in environment variables
- ✅ Use different tokens per environment (dev/staging/prod)
- ✅ Never commit tokens to git
- ✅ Rotate monthly or after suspected compromise
- ❌ Never share tokens via email or Slack
- ❌ Never log tokens in application code

### Access Control

**Who Should Have Access:**
- ✅ DevOps/SRE team (full access)
- ✅ Senior engineers (full access)
- ✅ Marketing leads (read + specific write access)
- ✅ Ops managers (read access)
- ❌ Contractors (unless specifically authorized)
- ❌ External vendors (never)

**Audit Log Review:**

Check logs daily for suspicious activity:
```bash
# In production logs, search for:
grep "[AUTH]" production.log | grep "success\":false"
```

Red flags:
- Multiple failed auth attempts from same IP
- Auth attempts from unexpected locations
- Changes made outside business hours
- Unusual parameter updates

---

## Backup & Recovery

### Automated Daily Backups

**Set up cron job (recommended):**

Create `/scripts/backup-config.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
cp data/config_store/config.csv "backups/config-$DATE.csv"
git add backups/
git commit -m "backup: daily config backup $DATE"
git push
```

Add to crontab:
```
0 2 * * * cd /path/to/project && bash scripts/backup-config.sh
```

### Manual Backup

Before major changes:
```bash
cp data/config_store/config.csv data/config_store/config.backup.$(date +%Y%m%d).csv
```

### Recovery Procedures

**Scenario 1: Accidental Delete**
```bash
git checkout HEAD -- data/config_store/config.csv
git push
```

**Scenario 2: Corrupted Data**
```bash
# Restore from specific date
cp backups/config-2025-10-28.csv data/config_store/config.csv
git add data/config_store/config.csv
git commit -m "restore: config from 2025-10-28"
git push
```

**Scenario 3: Complete Loss**
```bash
# Restore from git history
git log --oneline -- data/config_store/config.csv
git checkout <commit-hash> -- data/config_store/config.csv
git commit -m "restore: config from <commit-hash>"
git push
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **API Response Times**
   - GET /api/config: < 100ms
   - PUT /api/config: < 500ms
   - POST /api/config: < 1s

2. **Authentication Attempts**
   - Failed auth rate < 1%
   - Track unique IPs attempting access

3. **Configuration Changes**
   - Average changes per day
   - Changes by user
   - Most frequently changed keys

### Set Up Alerts

**Option 1: Simple Log Monitoring**
```bash
# Alert on multiple failed auth attempts
tail -f production.log | grep "[AUTH].*false" | \
  awk '{print $3}' | uniq -c | \
  awk '$1 > 5 {print "ALERT: "$1" failed attempts from "$2}'
```

**Option 2: Monitoring Service**

Configure your monitoring tool (Datadog, New Relic, etc.) to alert on:
- Failed auth rate > 5 in 5 minutes
- Config API response time > 1 second
- More than 20 config changes in 1 hour

### Health Checks

**Daily:**
```bash
node scripts/test-config-store.mjs
```

**Weekly:**
```bash
npm run typecheck
npm run build
```

---

## Troubleshooting

### Common Issues

**Issue: API Returns 401 Unauthorized**

Causes:
- Token not set in environment
- Incorrect token
- Token expired/rotated

Fix:
```bash
# Verify token is set
echo $CONFIG_ADMIN_TOKEN

# Test with explicit token
curl -X PUT "https://yourdomain.com/api/config" \
  -H "Authorization: Bearer your-actual-token" \
  -d '{"key":"test","value":"test"}'
```

**Issue: Configuration Changes Not Reflected**

Causes:
- Caching layer
- Deployment not complete
- Reading from wrong environment

Fix:
```bash
# Force read from CSV
curl "https://yourdomain.com/api/config?key=<key>&nocache=true"

# Check CSV directly
cat data/config_store/config.csv | grep "<key>"
```

**Issue: CSV File Corrupted**

Symptoms:
- Parse errors
- Missing columns
- Garbled data

Fix:
```bash
# Validate CSV structure
node -e "const fs=require('fs');const csv=fs.readFileSync('data/config_store/config.csv','utf8');console.log(csv.split('\\n')[0]);"

# Should output: key,value,updated_by,updated_at,version

# If corrupted, restore from backup
git checkout HEAD~1 -- data/config_store/config.csv
```

**Issue: Permission Denied on Write**

Fix:
```bash
# Check file permissions
ls -la data/config_store/config.csv

# Should be writable by app user
chmod 644 data/config_store/config.csv
```

---

## Emergency Procedures

### Emergency Rollback (< 5 minutes)

**Scenario:** Bad config change causing production issues

**Steps:**

1. **Identify Problem Change**
   ```bash
   curl "https://yourdomain.com/api/config?all=true" | jq '.'
   git log -1 -- data/config_store/config.csv
   ```

2. **Quick Rollback via API**
   ```bash
   # Revert to known good value
   curl -X PUT "https://yourdomain.com/api/config" \
     -H "Authorization: Bearer $CONFIG_ADMIN_TOKEN" \
     -d '{"key":"<problem-key>","value":"<good-value>","updated_by":"emergency-rollback"}'
   ```

3. **Verify Fix**
   ```bash
   curl "https://yourdomain.com/api/config?key=<problem-key>"
   ```

4. **Monitor Metrics**
   - Check error rates return to normal
   - Verify user impact resolved

5. **Post-Incident**
   - Document what happened
   - Add validation to prevent recurrence
   - Update runbook

### Security Incident Response

**Scenario:** Unauthorized access detected

**Immediate Actions:**

1. **Rotate Tokens**
   ```bash
   # Generate new token
   NEW_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

   # Update production environment
   # (specific steps depend on hosting platform)
   ```

2. **Audit Recent Changes**
   ```bash
   git log --since="24 hours ago" -- data/config_store/config.csv
   grep "seo\|security" data/config_store/config.csv
   ```

3. **Check for Damage**
   ```bash
   # Compare current config with yesterday's backup
   diff backups/config-$(date -d yesterday +%Y-%m-%d).csv data/config_store/config.csv
   ```

4. **Restore if Compromised**
   ```bash
   cp backups/config-last-known-good.csv data/config_store/config.csv
   git add data/config_store/config.csv
   git commit -m "security: restore config after incident"
   git push
   ```

5. **Notify Team**
   - Alert DevOps, Security, Leadership
   - Document timeline of incident
   - Review access logs

### Complete System Failure

**Scenario:** Config API completely unavailable

**Fallback Strategy:**

Application automatically falls back to environment variables:
```typescript
// Code already handles this gracefully
const siteName = getConfig('seo.siteName') ||
                 process.env.SEO_SITE_NAME ||
                 'Lab Essentials';
```

**Recovery:**

1. **Verify Fallbacks Working**
   - Check application still serving traffic
   - Verify critical paths functional

2. **Diagnose Root Cause**
   - API server issues?
   - CSV file corruption?
   - Network problems?

3. **Restore Service**
   - Fix root cause
   - Validate with test-config-store script
   - Gradually restore API access

---

## Contact Information

### Escalation Path

**Level 1:** DevOps/SRE Team
- Response time: < 15 minutes
- Handles: routine operations, standard troubleshooting

**Level 2:** Senior Engineering
- Response time: < 1 hour
- Handles: complex issues, security incidents

**Level 3:** Engineering Leadership
- Response time: < 4 hours
- Handles: critical business impact, strategic decisions

### Resources

- **Documentation:** `data/config_store/README.md`
- **Test Suite:** `node scripts/test-config-store.mjs`
- **Audit Reports:** `reports/` directory
- **Change History:** `git log -- data/config_store/config.csv`

---

**Document Owner:** Engineering Team
**Review Frequency:** Monthly
**Next Review:** 2025-11-29
