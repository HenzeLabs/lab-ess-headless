#!/bin/bash

# Emergency Rollback Script
# Fast rollback to previous deployment in case of production issues
#
# Usage: ./scripts/emergency-rollback.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}  🚨 EMERGENCY ROLLBACK${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}⚠️  WARNING: This will rollback your production deployment${NC}\n"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not found${NC}"
    echo "Install with: npm i -g vercel"
    exit 1
fi

# Get recent deployments
echo -e "${BLUE}Fetching recent production deployments...${NC}\n"

# Show deployments with colors
DEPLOYMENTS=$(vercel ls --prod 2>/dev/null | tail -n +2)

if [ -z "$DEPLOYMENTS" ]; then
    echo -e "${RED}Error: Could not fetch deployments. Are you logged in?${NC}"
    echo "Run: vercel login"
    exit 1
fi

echo -e "${GREEN}Recent Production Deployments:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Print header
printf "%-4s %-50s %-20s %-10s\n" "#" "URL" "AGE" "STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Parse and display deployments
i=1
while IFS= read -r line; do
    URL=$(echo "$line" | awk '{print $2}')
    AGE=$(echo "$line" | awk '{print $3}')
    STATUS=$(echo "$line" | awk '{print $4}')

    if [ $i -eq 1 ]; then
        printf "${BLUE}%-4s %-50s %-20s %-10s${NC}\n" "$i" "$URL" "$AGE" "$STATUS (CURRENT)"
    else
        printf "%-4s %-50s %-20s %-10s\n" "$i" "$URL" "$AGE" "$STATUS"
    fi

    ((i++))
done <<< "$DEPLOYMENTS"

echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

# Get user input for which deployment to rollback to
echo -e "${YELLOW}Which deployment do you want to rollback to?${NC}"
echo -e "${YELLOW}(Usually #2 for previous deployment)${NC}"
read -p "Enter number [1-5] or 'q' to quit: " CHOICE

if [ "$CHOICE" = "q" ] || [ "$CHOICE" = "Q" ]; then
    echo -e "${GREEN}Rollback cancelled${NC}"
    exit 0
fi

# Validate input
if ! [[ "$CHOICE" =~ ^[1-5]$ ]]; then
    echo -e "${RED}Invalid choice. Please enter a number between 1 and 5${NC}"
    exit 1
fi

# Get the deployment URL for the selected choice
SELECTED_URL=$(echo "$DEPLOYMENTS" | sed -n "${CHOICE}p" | awk '{print $2}')

if [ -z "$SELECTED_URL" ]; then
    echo -e "${RED}Error: Could not find deployment #${CHOICE}${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}You are about to rollback to:${NC}"
echo -e "${BLUE}${SELECTED_URL}${NC}"
echo ""

# Final confirmation
read -p "Are you absolutely sure? This will affect production! (yes/NO): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${GREEN}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  EXECUTING ROLLBACK${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Perform rollback
echo "Rolling back to: $SELECTED_URL"
echo ""

if vercel rollback "$SELECTED_URL"; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✅ ROLLBACK COMPLETE${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${YELLOW}NEXT STEPS:${NC}\n"

    echo "1. Verify rollback worked:"
    echo -e "   ${BLUE}curl -I https://store.labessentials.com${NC}\n"

    echo "2. Run smoke tests:"
    echo -e "   ${BLUE}PRODUCTION_URL=https://store.labessentials.com npm run test:smoke${NC}\n"

    echo "3. Monitor for 30 minutes:"
    echo "   - Error rates"
    echo "   - Response times"
    echo "   - User reports\n"

    echo "4. Notify stakeholders:"
    echo "   - Post in #incidents Slack channel"
    echo "   - Document the incident\n"

    echo "5. Investigate root cause:"
    echo "   - Review deployment logs"
    echo "   - Check error monitoring"
    echo "   - Identify what went wrong\n"

    # Log rollback
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "$TIMESTAMP - Emergency rollback to $SELECTED_URL" >> rollback-history.log

    echo -e "${GREEN}Rollback logged to: rollback-history.log${NC}"

else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ ROLLBACK FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${YELLOW}Try alternative rollback methods:${NC}\n"

    echo "1. Via Vercel Dashboard:"
    echo "   https://vercel.com/[your-org]/lab-ess-headless/deployments\n"

    echo "2. Via Git revert:"
    echo -e "   ${BLUE}git revert HEAD${NC}"
    echo -e "   ${BLUE}git push origin main${NC}\n"

    echo "3. Contact Vercel support:"
    echo "   support@vercel.com\n"

    exit 1
fi
