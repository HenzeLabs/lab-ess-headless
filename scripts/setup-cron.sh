#!/bin/bash

###############################################################################
# Setup Cron Jobs for Configuration Management Automation
#
# This script sets up automated tasks for:
# - Nightly S3 backups (2 AM)
# - Weekly audit reports (Monday 9 AM)
#
# Usage:
#   bash scripts/setup-cron.sh
#   bash scripts/setup-cron.sh --dry-run  # Preview without installing
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project directory (parent of scripts/)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN=false

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Configuration Management - Cron Job Setup                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on a system that supports cron
if ! command -v crontab &> /dev/null; then
  echo -e "${RED}❌ Error: crontab command not found${NC}"
  echo -e "${YELLOW}   This script requires cron to be installed.${NC}"
  echo -e "${YELLOW}   For Windows, consider using Task Scheduler instead.${NC}"
  exit 1
fi

# Verify Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Error: Node.js not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Project directory: ${PROJECT_DIR}"
echo -e "${GREEN}✓${NC} Node.js version: $(node --version)"
echo ""

# Create cron entries
BACKUP_CRON="0 2 * * * cd ${PROJECT_DIR} && npm run backup:s3 >> ${PROJECT_DIR}/logs/backup.log 2>&1"
REPORT_CRON="0 9 * * 1 cd ${PROJECT_DIR} && npm run report:weekly >> ${PROJECT_DIR}/logs/report.log 2>&1"

echo -e "${BLUE}Proposed Cron Jobs:${NC}"
echo ""
echo -e "${YELLOW}1. Nightly S3 Backup (2:00 AM daily)${NC}"
echo "   ${BACKUP_CRON}"
echo ""
echo -e "${YELLOW}2. Weekly Audit Report (9:00 AM Monday)${NC}"
echo "   ${REPORT_CRON}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}"
  exit 0
fi

# Prompt for confirmation
read -p "Install these cron jobs? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Setup cancelled${NC}"
  exit 0
fi

# Create logs directory
mkdir -p "${PROJECT_DIR}/logs"
echo -e "${GREEN}✓${NC} Created logs directory"

# Backup existing crontab
echo -e "${BLUE}Backing up existing crontab...${NC}"
crontab -l > "${PROJECT_DIR}/logs/crontab.backup.$(date +%Y%m%d-%H%M%S).txt" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Existing crontab backed up"

# Get current crontab
CURRENT_CRON=$(crontab -l 2>/dev/null || echo "")

# Check if our entries already exist
if echo "$CURRENT_CRON" | grep -q "npm run backup:s3"; then
  echo -e "${YELLOW}⚠️  Backup job already exists in crontab${NC}"
  read -p "Replace existing entry? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    CURRENT_CRON=$(echo "$CURRENT_CRON" | grep -v "npm run backup:s3")
  else
    echo -e "${YELLOW}⚠️  Skipping backup job${NC}"
    BACKUP_CRON=""
  fi
fi

if echo "$CURRENT_CRON" | grep -q "npm run report:weekly"; then
  echo -e "${YELLOW}⚠️  Report job already exists in crontab${NC}"
  read -p "Replace existing entry? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    CURRENT_CRON=$(echo "$CURRENT_CRON" | grep -v "npm run report:weekly")
  else
    echo -e "${YELLOW}⚠️  Skipping report job${NC}"
    REPORT_CRON=""
  fi
fi

# Add new entries
NEW_CRON="$CURRENT_CRON"

if [ -n "$BACKUP_CRON" ]; then
  NEW_CRON="${NEW_CRON}\n${BACKUP_CRON}"
fi

if [ -n "$REPORT_CRON" ]; then
  NEW_CRON="${NEW_CRON}\n${REPORT_CRON}"
fi

# Install new crontab
echo -e "$NEW_CRON" | crontab -

echo ""
echo -e "${GREEN}✅ Cron jobs installed successfully!${NC}"
echo ""
echo -e "${BLUE}Installed Jobs:${NC}"
crontab -l | grep -E "(backup:s3|report:weekly)" || echo "  (none)"
echo ""

# Test the commands manually
echo -e "${BLUE}Testing Commands:${NC}"
echo ""

echo -e "${YELLOW}Testing backup command...${NC}"
if cd "$PROJECT_DIR" && npm run backup:s3 --dry-run 2>&1 | grep -q "npm"; then
  echo -e "${GREEN}✓${NC} Backup command is valid"
else
  echo -e "${RED}❌${NC} Backup command may have issues"
fi

echo -e "${YELLOW}Testing report command...${NC}"
if cd "$PROJECT_DIR" && npm run report:weekly --help 2>&1 | grep -q "npm"; then
  echo -e "${GREEN}✓${NC} Report command is valid"
else
  echo -e "${RED}❌${NC} Report command may have issues"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    Setup Complete! 🎉                         ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Monitor logs in: ${PROJECT_DIR}/logs/"
echo "2. Verify first backup runs at 2:00 AM"
echo "3. Check first report on next Monday at 9:00 AM"
echo "4. View cron jobs: crontab -l"
echo "5. Edit cron jobs: crontab -e"
echo "6. Remove cron jobs: crontab -r"
echo ""
echo -e "${YELLOW}⚠️  Note: Ensure environment variables are set for the cron user${NC}"
echo "   You may need to add them to ~/.profile or /etc/environment"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  • View logs: tail -f ${PROJECT_DIR}/logs/backup.log"
echo "  • View logs: tail -f ${PROJECT_DIR}/logs/report.log"
echo "  • Test backup: npm run backup:s3"
echo "  • Test report: npm run report:weekly"
echo ""
