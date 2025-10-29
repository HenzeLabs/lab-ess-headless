#!/bin/bash

###############################################################################
# Production Cron Job Setup Script
# Sets up automated backups and weekly email reports
#
# This script will:
#   1. Create logs directory
#   2. Backup existing crontab
#   3. Add cron jobs for:
#      - Nightly S3 backup (2:00 AM)
#      - Weekly audit report + email (Monday 9:00 AM)
#
# Usage:
#   sudo ./scripts/setup-production-cron.sh
#
# Requirements:
#   - AWS credentials configured (for S3 backup)
#   - SENDGRID_API_KEY set (for email reports)
#   - Node.js and npm installed
###############################################################################

set -e  # Exit on error

echo "=========================================="
echo "Lab Essentials Production Cron Setup"
echo "=========================================="
echo ""

# Detect project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && [ -z "$SUDO_USER" ]; then
  echo "⚠️  Warning: This script should be run with sudo for system-wide cron jobs"
  echo "   However, it can run as current user for user-specific cron jobs"
  echo ""
  read -p "Continue as current user? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. Run with: sudo ./scripts/setup-production-cron.sh"
    exit 1
  fi
fi

# Create logs directory if it doesn't exist
echo "📂 Creating logs directory..."
mkdir -p "$PROJECT_DIR/logs"
chmod 755 "$PROJECT_DIR/logs"
echo "✅ Logs directory ready: $PROJECT_DIR/logs"
echo ""

# Check for required environment variables
echo "🔍 Checking environment variables..."

MISSING_VARS=()

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  MISSING_VARS+=("AWS_ACCESS_KEY_ID")
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  MISSING_VARS+=("AWS_SECRET_ACCESS_KEY")
fi

if [ -z "$S3_BACKUP_BUCKET" ]; then
  MISSING_VARS+=("S3_BACKUP_BUCKET")
fi

if [ -z "$SENDGRID_API_KEY" ]; then
  MISSING_VARS+=("SENDGRID_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "⚠️  Warning: The following environment variables are not set:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "Cron jobs will be created, but may fail without these variables."
  echo "Add them to your environment or /etc/environment for system-wide access."
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. Set environment variables and try again."
    exit 1
  fi
else
  echo "✅ All required environment variables are set"
fi
echo ""

# Backup existing crontab
echo "💾 Backing up existing crontab..."
BACKUP_FILE="$PROJECT_DIR/logs/crontab.backup.$(date +%Y%m%d_%H%M%S)"

if crontab -l > /dev/null 2>&1; then
  crontab -l > "$BACKUP_FILE"
  echo "✅ Crontab backed up to: $BACKUP_FILE"
else
  echo "ℹ️  No existing crontab found (this is normal for new installations)"
fi
echo ""

# Define cron jobs
echo "📝 Configuring cron jobs..."

# Export environment variables in cron
ENV_VARS="
# Lab Essentials Environment Variables (added by setup-production-cron.sh)
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_REGION=${AWS_REGION:-us-east-1}
S3_BACKUP_BUCKET=$S3_BACKUP_BUCKET
SENDGRID_API_KEY=$SENDGRID_API_KEY
EMAIL_TO=${EMAIL_TO:-laurenh@lwscientific.com}
EMAIL_FROM=${EMAIL_FROM:-noreply@labessentials.com}
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin
"

# Nightly backup at 2:00 AM
BACKUP_CRON="0 2 * * * cd $PROJECT_DIR && /usr/local/bin/npm run backup:s3 >> $PROJECT_DIR/logs/backup.log 2>&1"

# Weekly report + email every Monday at 9:00 AM
REPORT_CRON="0 9 * * 1 cd $PROJECT_DIR && /usr/local/bin/npm run report:weekly && $PROJECT_DIR/scripts/send-weekly-email.sh >> $PROJECT_DIR/logs/email.log 2>&1"

echo "Cron jobs to be added:"
echo ""
echo "1. Nightly S3 Backup:"
echo "   Schedule: Every day at 2:00 AM"
echo "   Command: npm run backup:s3"
echo "   Log: $PROJECT_DIR/logs/backup.log"
echo ""
echo "2. Weekly Report + Email:"
echo "   Schedule: Every Monday at 9:00 AM"
echo "   Command: npm run report:weekly && send-weekly-email.sh"
echo "   Log: $PROJECT_DIR/logs/email.log"
echo "   Recipient: laurenh@lwscientific.com"
echo ""

read -p "Add these cron jobs? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Canceled. No changes made."
  exit 0
fi

# Create new crontab
TEMP_CRON=$(mktemp)

# Add existing crontab (if any)
if crontab -l > /dev/null 2>&1; then
  crontab -l | grep -v "Lab Essentials" > "$TEMP_CRON" || true
fi

# Add new cron jobs
{
  echo ""
  echo "# =============================================="
  echo "# Lab Essentials Configuration Management"
  echo "# Added by: $USER on $(date)"
  echo "# =============================================="
  echo "$ENV_VARS"
  echo ""
  echo "# Nightly S3 backup (2:00 AM)"
  echo "$BACKUP_CRON"
  echo ""
  echo "# Weekly report + email (Monday 9:00 AM)"
  echo "$REPORT_CRON"
  echo ""
} >> "$TEMP_CRON"

# Install new crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo "✅ Cron jobs installed successfully!"
echo ""

# Verify installation
echo "📋 Current crontab:"
echo "=========================================="
crontab -l | grep -A 15 "Lab Essentials"
echo "=========================================="
echo ""

# Test backup script
echo "🧪 Testing backup script..."
if [ -f "$PROJECT_DIR/scripts/backup-config.sh" ]; then
  echo "   Found: backup-config.sh"
else
  echo "   ⚠️  Warning: backup-config.sh not found"
fi

# Test email script
echo "🧪 Testing email script..."
if [ -f "$PROJECT_DIR/scripts/send-weekly-email.sh" ]; then
  echo "   Found: send-weekly-email.sh"
  if [ -x "$PROJECT_DIR/scripts/send-weekly-email.sh" ]; then
    echo "   ✅ Executable permissions set"
  else
    echo "   ⚠️  Warning: Not executable, fixing..."
    chmod +x "$PROJECT_DIR/scripts/send-weekly-email.sh"
    echo "   ✅ Fixed"
  fi
else
  echo "   ⚠️  Warning: send-weekly-email.sh not found"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "✅ Cron jobs configured:"
echo "   1. Nightly backup: 2:00 AM daily"
echo "   2. Weekly email: 9:00 AM every Monday"
echo ""
echo "📂 Logs will be saved to:"
echo "   - Backup: $PROJECT_DIR/logs/backup.log"
echo "   - Email: $PROJECT_DIR/logs/email.log"
echo ""
echo "🔍 Next steps:"
echo "   1. Test backup manually:"
echo "      cd $PROJECT_DIR && npm run backup:s3"
echo ""
echo "   2. Test email manually:"
echo "      cd $PROJECT_DIR && ./scripts/send-weekly-email.sh"
echo ""
echo "   3. Monitor logs:"
echo "      tail -f $PROJECT_DIR/logs/backup.log"
echo "      tail -f $PROJECT_DIR/logs/email.log"
echo ""
echo "   4. Check cron status:"
echo "      crontab -l"
echo "      grep CRON /var/log/syslog  # On Ubuntu/Debian"
echo "      grep CRON /var/log/cron    # On CentOS/RHEL"
echo ""
echo "🗑️  To remove cron jobs:"
echo "   crontab -e"
echo "   Delete lines added by this script"
echo ""
echo "💾 Crontab backup saved to:"
echo "   $BACKUP_FILE"
echo ""
echo "=========================================="
