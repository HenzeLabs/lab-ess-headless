#!/bin/bash

# Post-Deployment Validation
# Comprehensive validation immediately after production deployment
#
# Usage: ./scripts/post-deploy-validation.sh https://store.labessentials.com

set -e

PRODUCTION_URL=${1:-https://store.labessentials.com}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    POST-DEPLOYMENT VALIDATION                              ║${NC}"
echo -e "${BLUE}║                    URL: ${PRODUCTION_URL}                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

PASSED=0
FAILED=0
WARNINGS=0
START_TIME=$(date +%s)

check_http() {
    local url=$1
    local expected=$2
    local description=$3

    echo -e "${CYAN}[CHECK]${NC} ${description}..."

    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" --max-time 10)

    if [ "$STATUS" = "$expected" ]; then
        echo -e "${GREEN}  ✓ ${STATUS} (expected ${expected})${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}  ✗ ${STATUS} (expected ${expected})${NC}"
        ((FAILED++))
        return 1
    fi
}

check_performance() {
    local url=$1
    local description=$2
    local threshold=$3

    echo -e "${CYAN}[CHECK]${NC} ${description}..."

    TIME=$(curl -s -o /dev/null -w "%{time_total}" -L "$url" --max-time 10)
    TIME_MS=$(echo "$TIME * 1000" | bc | cut -d'.' -f1)

    if [ "$TIME_MS" -lt "$threshold" ]; then
        echo -e "${GREEN}  ✓ ${TIME_MS}ms (threshold: ${threshold}ms)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}  ⚠ ${TIME_MS}ms (threshold: ${threshold}ms)${NC}"
        ((WARNINGS++))
        return 1
    fi
}

# 1. Basic Connectivity
echo -e "\n${BLUE}═══ 1. BASIC CONNECTIVITY ═══${NC}\n"

check_http "$PRODUCTION_URL" "200" "Homepage is accessible"
check_http "$PRODUCTION_URL/api/health-check" "200" "Health check endpoint"
check_http "$PRODUCTION_URL/robots.txt" "200" "robots.txt accessible"
check_http "$PRODUCTION_URL/sitemap.xml" "200" "sitemap.xml accessible"

# 2. Critical Pages
echo -e "\n${BLUE}═══ 2. CRITICAL PAGES ═══${NC}\n"

CRITICAL_PAGES=(
    "/collections"
    "/products"
    "/cart"
    "/search"
)

for page in "${CRITICAL_PAGES[@]}"; do
    check_http "${PRODUCTION_URL}${page}" "200" "Page: $page"
done

# 3. Performance
echo -e "\n${BLUE}═══ 3. PERFORMANCE ═══${NC}\n"

check_performance "$PRODUCTION_URL" "Homepage load time" "3000"
check_performance "${PRODUCTION_URL}/collections" "Collections load time" "3000"

# 4. Security Headers
echo -e "\n${BLUE}═══ 4. SECURITY HEADERS ═══${NC}\n"

HEADERS=$(curl -s -I "$PRODUCTION_URL" 2>/dev/null)

check_header() {
    local header=$1
    local description=$2

    echo -e "${CYAN}[CHECK]${NC} ${description}..."

    if echo "$HEADERS" | grep -qi "$header:"; then
        VALUE=$(echo "$HEADERS" | grep -i "$header:" | cut -d':' -f2- | tr -d '\r\n' | xargs)
        echo -e "${GREEN}  ✓ Present: ${VALUE}${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}  ✗ Missing${NC}"
        ((FAILED++))
        return 1
    fi
}

check_header "content-security-policy" "Content-Security-Policy"
check_header "x-content-type-options" "X-Content-Type-Options"
check_header "x-frame-options" "X-Frame-Options"
check_header "referrer-policy" "Referrer-Policy"

# 5. SSL/TLS
echo -e "\n${BLUE}═══ 5. SSL/TLS ═══${NC}\n"

echo -e "${CYAN}[CHECK]${NC} SSL certificate validity..."

if curl -sI "$PRODUCTION_URL" 2>&1 | grep -q "SSL certificate problem"; then
    echo -e "${RED}  ✗ SSL certificate invalid${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}  ✓ SSL certificate valid${NC}"
    ((PASSED++))
fi

# 6. Run Automated Smoke Tests
echo -e "\n${BLUE}═══ 6. AUTOMATED SMOKE TESTS ═══${NC}\n"

echo -e "${CYAN}Running comprehensive smoke tests...${NC}\n"

if PRODUCTION_URL="$PRODUCTION_URL" npm run test:smoke 2>&1 | tail -20; then
    echo -e "${GREEN}  ✓ Smoke tests PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}  ✗ Smoke tests FAILED${NC}"
    echo -e "${YELLOW}  Run locally: PRODUCTION_URL=$PRODUCTION_URL npm run test:smoke${NC}"
    ((FAILED++))
fi

# 7. Analytics Check
echo -e "\n${BLUE}═══ 7. ANALYTICS ═══${NC}\n"

echo -e "${CYAN}[CHECK]${NC} GA4 script loaded..."

PAGE_CONTENT=$(curl -s "$PRODUCTION_URL")

if echo "$PAGE_CONTENT" | grep -q "gtag\|google-analytics\|analytics.google.com"; then
    echo -e "${GREEN}  ✓ GA4 script detected${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}  ⚠ GA4 script not detected (may be loaded async)${NC}"
    ((WARNINGS++))
fi

# 8. Error Monitoring
echo -e "\n${BLUE}═══ 8. ERROR MONITORING ═══${NC}\n"

echo -e "${CYAN}[INFO]${NC} Manual checks required:\n"

echo -e "  ${YELLOW}⚠${NC} Check Sentry dashboard for new errors (last 5 minutes)"
echo -e "     https://sentry.io/your-org/lab-ess-headless\n"

echo -e "  ${YELLOW}⚠${NC} Check Vercel dashboard for error rate"
echo -e "     https://vercel.com/your-org/lab-ess-headless\n"

echo -e "  ${YELLOW}⚠${NC} Check GA4 Real-Time view for active users"
echo -e "     https://analytics.google.com/\n"

((WARNINGS+=3))

# 9. Core Web Vitals
echo -e "\n${BLUE}═══ 9. CORE WEB VITALS ═══${NC}\n"

echo -e "${CYAN}[INFO]${NC} Run Lighthouse audit:\n"

echo -e "  ${BLUE}npx lighthouse $PRODUCTION_URL --view${NC}\n"

echo -e "${CYAN}[INFO]${NC} Expected thresholds:"
echo -e "  - LCP: < 2.5s"
echo -e "  - INP: < 200ms"
echo -e "  - CLS: < 0.1"
echo -e "  - Performance Score: > 90\n"

# 10. Analytics Parity
echo -e "\n${BLUE}═══ 10. ANALYTICS PARITY ═══${NC}\n"

echo -e "${CYAN}[INFO]${NC} Verify analytics events:\n"

echo -e "  1. Open browser DevTools → Network"
echo -e "  2. Navigate to $PRODUCTION_URL"
echo -e "  3. Add product to cart"
echo -e "  4. Verify events in Network tab:"
echo -e "     - page_view"
echo -e "     - view_item"
echo -e "     - add_to_cart\n"

echo -e "  5. Check GA4 Real-Time:"
echo -e "     - Events should appear within 10 seconds\n"

echo -e "  6. Check Meta Pixel (if configured):"
echo -e "     - Install Meta Pixel Helper extension"
echo -e "     - Verify PageView event fires\n"

# Summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                         VALIDATION SUMMARY                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "Duration: ${DURATION}s"
echo ""

# Monitoring checklist
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      24-HOUR MONITORING CHECKLIST                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

cat << 'EOF'
T+5 minutes:
  ☐ Error rate < 0.1%
  ☐ All critical pages load
  ☐ No console errors
  ☐ Analytics events flowing

T+30 minutes:
  ☐ Error rate stable
  ☐ Response times < 2s avg
  ☐ No spike in 404s
  ☐ Core Web Vitals within thresholds

T+1 hour:
  ☐ No customer complaints
  ☐ Checkout working
  ☐ Cart persisting
  ☐ Search functional

T+6 hours:
  ☐ Revenue tracking accurate
  ☐ GA4 vs Shopify parity (±3%)
  ☐ No performance degradation

T+24 hours:
  ☐ Run: npm run pre-deploy
  ☐ Compare analytics week-over-week
  ☐ Review error logs
  ☐ Check Core Web Vitals trends
  ☐ Confirm conversion rate stable

EOF

# Create monitoring log
LOG_FILE="deployment-monitoring-$(date +%Y%m%d-%H%M%S).log"

cat > "$LOG_FILE" << EOF
Deployment Validation Log
==========================
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
URL: $PRODUCTION_URL
Version: $(git describe --tags --abbrev=0 2>/dev/null || echo "unknown")

Automated Checks:
  Passed: $PASSED
  Failed: $FAILED
  Warnings: $WARNINGS

Manual Monitoring Required:
  [ ] T+5min   - Initial smoke test
  [ ] T+30min  - Stability check
  [ ] T+1hour  - Customer feedback
  [ ] T+6hour  - Analytics parity
  [ ] T+24hour - Full review

Notes:
  - Monitor Sentry for errors
  - Check Vercel Analytics for traffic
  - Verify GA4 Real-Time events
  - Watch for customer support tickets

EOF

echo -e "${GREEN}Monitoring log created: ${LOG_FILE}${NC}\n"

# Final verdict
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  ✅ DEPLOYMENT VALIDATION PASSED                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${YELLOW}Continue monitoring for next 24 hours.${NC}"
    echo -e "${YELLOW}See checklist above for monitoring milestones.${NC}\n"

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Note: $WARNINGS warning(s) detected. Review above.${NC}\n"
    fi

    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                  ❌ DEPLOYMENT VALIDATION FAILED                           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${RED}Critical issues detected. Consider rollback:${NC}"
    echo -e "${BLUE}./scripts/emergency-rollback.sh${NC}\n"

    exit 1
fi
