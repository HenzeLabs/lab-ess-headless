#!/bin/bash

# Royal Testing Suite - Validate all improvements 👑🧪

echo "👑 Royal Testing Suite - Validating Your Kingly E-commerce Platform"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
TOTAL=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🧪 Testing: ${test_name}${NC}"
    TOTAL=$((TOTAL + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: ${test_name}${NC}"
        FAILED=$((FAILED + 1))
        
        # Show error details for debugging
        echo -e "${YELLOW}   Error details:${NC}"
        eval "$test_command" | head -5
        echo ""
    fi
}

echo -e "${PURPLE}🏰 Phase 1: Build & Deployment Tests${NC}"
echo "----------------------------------------"

run_test "TypeScript Compilation" "npm run typecheck"
run_test "ESLint Code Quality" "npm run lint"
run_test "Production Build" "npm run build"
run_test "Mobile Navigation Tests" "npx playwright test tests/mobile-navigation.spec.ts --timeout=10000"

echo ""
echo -e "${PURPLE}🎨 Phase 2: UI/UX Component Tests${NC}"
echo "----------------------------------------"

run_test "Royal Components Exist" "test -f src/components/ui/royal-components.tsx"
run_test "Royal Product Card Exists" "test -f src/components/ui/royal-product-card.tsx"
run_test "Royal Loading Components Exist" "test -f src/components/ui/royal-loading.tsx"
run_test "Royal Checkout Components Exist" "test -f src/components/ui/royal-checkout.tsx"
run_test "Royal Hero Component Exists" "test -f src/components/RoyalHero.tsx"

echo ""
echo -e "${PURPLE}🔒 Phase 3: Security & Configuration Tests${NC}"
echo "--------------------------------------------"

run_test "Security Headers Configuration" "grep -q 'X-Content-Type-Options' next.config.mjs"
run_test "HTTPS Redirect Configuration" "grep -q 'Strict-Transport-Security' next.config.mjs"
run_test "Cache Headers Configuration" "grep -q 'Cache-Control' next.config.mjs"
run_test "Environment Configuration" "test -f .env.local"
run_test "Deployment Scripts Available" "test -f deploy-royal.sh && test -x deploy-royal.sh"
run_test "Security Audit Script Available" "test -f royal-security-audit.sh && test -x royal-security-audit.sh"

echo ""
echo -e "${PURPLE}⚡ Phase 4: Performance Tests${NC}"
echo "----------------------------------"

run_test "Bundle Analysis Configuration" "grep -q 'withBundleAnalyzer' next.config.mjs"
run_test "Image Optimization Configuration" "grep -q 'formats.*webp.*avif' next.config.mjs"
run_test "PWA Configuration" "grep -q 'withPWA' next.config.mjs"
run_test "Webpack Optimization" "grep -q 'splitChunks' next.config.mjs"

echo ""
echo -e "${PURPLE}🛒 Phase 5: E-commerce Functionality Tests${NC}"
echo "---------------------------------------------"

# Test core pages exist and are accessible
run_test "Homepage Loads" "curl -f http://localhost:3002/ -o /dev/null -s"
run_test "Collections Page Loads" "curl -f http://localhost:3002/collections -o /dev/null -s"
run_test "Products API Responds" "curl -f http://localhost:3002/api/products -o /dev/null -s"
run_test "Cart API Responds" "curl -f http://localhost:3002/api/cart -o /dev/null -s"

echo ""
echo "=============================================="
echo -e "${PURPLE}👑 ROYAL TEST RESULTS SUMMARY${NC}"
echo "=============================================="

# Calculate percentage
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
else
    PERCENTAGE=0
fi

echo -e "📊 Tests Run: ${BLUE}$TOTAL${NC}"
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"
echo -e "📈 Success Rate: ${PURPLE}$PERCENTAGE%${NC}"

echo ""

# Determine royal status
if [ $PERCENTAGE -ge 95 ]; then
    echo -e "${PURPLE}🏆 ROYAL STATUS: EMPEROR GRADE!${NC}"
    echo -e "${GREEN}Your e-commerce platform is truly worthy of royalty!${NC}"
    echo -e "${BLUE}Ready for kings and queens to shop! 👑${NC}"
elif [ $PERCENTAGE -ge 85 ]; then
    echo -e "${PURPLE}👑 ROYAL STATUS: KING GRADE!${NC}"
    echo -e "${GREEN}Excellent! Your platform is nearly perfect.${NC}"
    echo -e "${YELLOW}A few minor improvements and you'll be emperor-grade!${NC}"
elif [ $PERCENTAGE -ge 75 ]; then
    echo -e "${PURPLE}🤴 ROYAL STATUS: PRINCE GRADE${NC}"
    echo -e "${YELLOW}Good progress! Address the failing tests for royal status.${NC}"
elif [ $PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}🏰 ROYAL STATUS: NOBLE GRADE${NC}"
    echo -e "${YELLOW}Getting there! More work needed for true royalty.${NC}"
else
    echo -e "${RED}⚔️  ROYAL STATUS: KNIGHT GRADE${NC}"
    echo -e "${RED}Significant work needed to achieve royal status.${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "1. Fix the ${RED}$FAILED${NC} failing tests above"
    echo "2. Re-run this test suite"
    echo "3. Execute ./deploy-royal.sh when ready"
else
    echo -e "${GREEN}1. All tests passed! Ready for deployment${NC}"
    echo "2. Run ./deploy-royal.sh for production deployment"
    echo "3. Run ./royal-security-audit.sh for security verification"
    echo "4. Monitor performance with Lighthouse"
fi

echo ""
echo -e "${PURPLE}👑 Long live the King! Your royal e-commerce platform awaits! 👑${NC}"

# Exit with appropriate code
if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi