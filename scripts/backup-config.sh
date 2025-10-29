#!/bin/bash

# =============================================================================
# Configuration Store Automated Backup Script
# Purpose: Create daily backups of configuration with git tracking
# Usage: Run via cron job or manually
# =============================================================================

set -e  # Exit on error

# Configuration
BACKUP_DIR="backups/config"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
SOURCE_FILE="data/config_store/config.csv"
RETENTION_DAYS=90

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔒 Configuration Store Backup"
echo "================================================================="
echo "Date: $DATE"
echo "Time: $(date +%H:%M:%S)"
echo ""

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ Error: Configuration file not found at $SOURCE_FILE${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup with timestamp
BACKUP_FILE="$BACKUP_DIR/config-$TIMESTAMP.csv"
cp "$SOURCE_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✅ Created backup: $BACKUP_FILE${NC}"

# Create daily backup (overwrite if exists)
DAILY_BACKUP="$BACKUP_DIR/config-$DATE.csv"
cp "$SOURCE_FILE" "$DAILY_BACKUP"
echo -e "${GREEN}✅ Updated daily backup: $DAILY_BACKUP${NC}"

# Create symbolic link to latest backup
ln -sf "config-$TIMESTAMP.csv" "$BACKUP_DIR/config-latest.csv"
echo -e "${GREEN}✅ Updated latest backup link${NC}"

# Verify backup integrity
if node -e "
const fs = require('fs');
const parse = require('csv-parse/sync').parse;
try {
  const csv = fs.readFileSync('$BACKUP_FILE', 'utf8');
  const records = parse(csv, { columns: true });
  if (records.length > 0 && records[0].key && records[0].value) {
    console.log('OK');
    process.exit(0);
  }
} catch(e) {
  console.error(e.message);
  process.exit(1);
}
" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backup integrity verified${NC}"
else
    echo -e "${RED}❌ Backup integrity check failed!${NC}"
    exit 1
fi

# Count parameters in backup
PARAM_COUNT=$(tail -n +2 "$BACKUP_FILE" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Backed up $PARAM_COUNT parameters${NC}"

# Clean up old backups (keep last 90 days)
if [ "$RETENTION_DAYS" -gt 0 ]; then
    echo ""
    echo "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "config-*.csv" -type f -mtime +$RETENTION_DAYS -delete
    CLEANED=$(find "$BACKUP_DIR" -name "config-*.csv" -type f -mtime +$RETENTION_DAYS | wc -l | tr -d ' ')
    if [ "$CLEANED" -gt 0 ]; then
        echo -e "${GREEN}✅ Removed $CLEANED old backups${NC}"
    fi
fi

# Add to git (if in a git repository)
if [ -d ".git" ]; then
    echo ""
    echo "Committing backup to git..."

    # Add all backups
    git add "$BACKUP_DIR"

    # Create commit
    if git commit -m "backup: daily config backup $DATE ($PARAM_COUNT parameters)" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Committed backup to git${NC}"

        # Optionally push to remote (uncomment if desired)
        # if git push origin main >/dev/null 2>&1; then
        #     echo -e "${GREEN}✅ Pushed backup to remote${NC}"
        # fi
    else
        echo -e "${YELLOW}⚠️  No changes to commit (backup identical to previous)${NC}"
    fi
fi

# Generate backup report
REPORT_FILE="$BACKUP_DIR/backup-report-$DATE.txt"
cat > "$REPORT_FILE" << EOF
Configuration Store Backup Report
================================================================================
Backup Date: $DATE
Backup Time: $(date +%H:%M:%S)
Backup File: $BACKUP_FILE
Parameters: $PARAM_COUNT
Source File: $SOURCE_FILE
Source Size: $(wc -c < "$SOURCE_FILE" | tr -d ' ') bytes
Backup Size: $(wc -c < "$BACKUP_FILE" | tr -d ' ') bytes
Retention: $RETENTION_DAYS days

Top 5 Most Recently Updated Parameters:
EOF

# Add most recently updated parameters to report
tail -n +2 "$BACKUP_FILE" | \
    awk -F',' '{print $4,$1}' | \
    sort -r | \
    head -5 | \
    awk '{printf "  - %s: %s\n", $2, $1}' >> "$REPORT_FILE"

echo ""
echo -e "${GREEN}✅ Backup report: $REPORT_FILE${NC}"

# Summary
echo ""
echo "================================================================="
echo -e "${GREEN}✅ Backup Complete${NC}"
echo "================================================================="
echo "Backup Location: $BACKUP_FILE"
echo "Daily Backup: $DAILY_BACKUP"
echo "Parameters Backed Up: $PARAM_COUNT"
echo "Retention Policy: $RETENTION_DAYS days"
echo ""

# Exit successfully
exit 0
