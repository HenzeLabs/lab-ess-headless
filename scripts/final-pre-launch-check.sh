#!/bin/bash

# Final Pre-Launch Validation
# Comprehensive check before production deployment
#
# Usage: ./scripts/final-pre-launch-check.sh v1.0.0

set -e

VERSION=${1:-v1.0.0}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    FINAL PRE-LAUNCH VALIDATION                             ║${NC}"
echo -e "${BLUE}║                         Version: ${VERSION}                                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

PASSED=0
FAILED=0
WARNINGS=0

check_step() {
    local description=$1
    local command=$2

    echo -e "${CYAN}[CHECK]${NC} ${description}..."

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}  ✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

check_step_with_output() {
    local description=$1
    local command=$2

    echo -e "${CYAN}[CHECK]${NC} ${description}..."

    if eval "$command"; then
        echo -e "${GREEN}  ✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}  ✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

warn_step() {
    local description=$1
    local message=$2

    echo -e "${YELLOW}[WARN]${NC} ${description}"
    echo -e "${YELLOW}  ⚠ ${message}${NC}"
    ((WARNINGS++))
}

# 1. Environment Verification
echo -e "\n${BLUE}═══ 1. ENVIRONMENT VERIFICATION ═══${NC}\n"

check_step "Git working directory clean" "[ -z \"\$(git status --porcelain)\" ]"
check_step "On main branch" "[ \"\$(git branch --show-current)\" = \"main\" ]"
check_step "Up to date with origin" "git fetch origin && [ \"\$(git rev-parse HEAD)\" = \"\$(git rev-parse origin/main)\" ]"

# 2. Dependencies
echo -e "\n${BLUE}═══ 2. DEPENDENCIES ═══${NC}\n"

check_step "Node modules installed" "[ -d \"node_modules\" ]"
check_step "Package-lock.json in sync" "npm ci --dry-run"

# Check for outdated critical dependencies
OUTDATED=$(npm outdated --json 2>/dev/null || echo "{}")
if [ "$OUTDATED" != "{}" ]; then
    warn_step "Outdated dependencies detected" "Run 'npm outdated' to review"
fi

# 3. Code Quality
echo -e "\n${BLUE}═══ 3. CODE QUALITY ═══${NC}\n"

check_step_with_output "TypeScript compilation" "npm run typecheck"
check_step_with_output "ESLint validation" "npm run lint"

# 4. Security
echo -e "\n${BLUE}═══ 4. SECURITY ═══${NC}\n"

check_step_with_output "Security audit" "npm run audit:security"

# Check for high/critical vulnerabilities
VULNERABILITIES=$(npm audit --json 2>/dev/null | grep -o '"high":[0-9]*' | cut -d':' -f2 || echo "0")
if [ "$VULNERABILITIES" -gt 0 ]; then
    warn_step "High severity vulnerabilities" "$VULNERABILITIES vulnerabilities found"
fi

# 5. Build
echo -e "\n${BLUE}═══ 5. BUILD VERIFICATION ═══${NC}\n"

check_step_with_output "Production build" "npm run build"
check_step_with_output "Bundle size validation" "npm run audit:bundle"

# Check if build artifacts exist
check_step "Build artifacts created" "[ -d \".next\" ]"
check_step "Static files generated" "[ -d \".next/static\" ]"

# 6. SEO & Content
echo -e "\n${BLUE}═══ 6. SEO & CONTENT ═══${NC}\n"

check_step_with_output "SEO validation" "npm run audit:seo"
check_step "Sitemap exists" "[ -f \"src/app/sitemap.ts\" ] || [ -f \"public/sitemap.xml\" ]"
check_step "Robots.txt exists" "[ -f \"src/app/robots.ts\" ] || [ -f \"public/robots.txt\" ]"

# 7. Configuration Files
echo -e "\n${BLUE}═══ 7. CONFIGURATION FILES ═══${NC}\n"

check_step "next.config.mjs exists" "[ -f \"next.config.mjs\" ]"
check_step "deployment-gates.config.json exists" "[ -f \"deployment-gates.config.json\" ]"
check_step ".env.example exists" "[ -f \".env.example\" ]"

# Verify environment variables are documented
if [ -f ".env.example" ]; then
    REQUIRED_VARS=("SHOPIFY_STORE_DOMAIN" "SHOPIFY_STOREFRONT_ACCESS_TOKEN" "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "$var" .env.example; then
            check_step "$var documented in .env.example" "true"
        else
            warn_step "$var missing from .env.example" "Add to .env.example"
        fi
    done
fi

# 8. Documentation
echo -e "\n${BLUE}═══ 8. DOCUMENTATION ═══${NC}\n"

DOCS=(
    "DEPLOYMENT_PLAYBOOK.md"
    "DEPLOYMENT_AUDIT.md"
    "ROLLBACK_PROCEDURES.md"
    "OBSERVABILITY_SETUP.md"
    "DEPLOYMENT_SYSTEM_README.md"
)

for doc in "${DOCS[@]}"; do
    check_step "$doc exists" "[ -f \"$doc\" ]"
done

# 9. Scripts
echo -e "\n${BLUE}═══ 9. DEPLOYMENT SCRIPTS ═══${NC}\n"

SCRIPTS=(
    "scripts/prepare-release.sh"
    "scripts/emergency-rollback.sh"
    "scripts/pre-deploy-checklist.mjs"
    "scripts/check-security.mjs"
    "scripts/check-bundle-size.mjs"
)

for script in "${SCRIPTS[@]}"; do
    check_step "$script exists" "[ -f \"$script\" ]"
    check_step "$script is executable" "[ -x \"$script\" ]" || chmod +x "$script"
done

# 10. CI/CD Workflows
echo -e "\n${BLUE}═══ 10. CI/CD WORKFLOWS ═══${NC}\n"

check_step "deployment-gates.yml exists" "[ -f \".github/workflows/deployment-gates.yml\" ]"
check_step "scheduled-governance.yml exists" "[ -f \".github/workflows/scheduled-governance.yml\" ]"

# 11. Test Infrastructure
echo -e "\n${BLUE}═══ 11. TEST INFRASTRUCTURE ═══${NC}\n"

check_step "Playwright config exists" "[ -f \"playwright.config.ts\" ]"
check_step "Post-deploy smoke tests exist" "[ -f \"tests/post-deploy-smoke.spec.ts\" ]"
check_step "Core tests exist" "[ -f \"tests/homepage.spec.ts\" ]"

# 12. Release Preparation
echo -e "\n${BLUE}═══ 12. RELEASE PREPARATION ═══${NC}\n"

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    warn_step "Tag $VERSION already exists" "Delete with: git tag -d $VERSION"
else
    echo -e "${GREEN}  ✓ Tag $VERSION is available${NC}"
    ((PASSED++))
fi

# Check if CHANGELOG exists
if [ -f "CHANGELOG.md" ]; then
    check_step "CHANGELOG.md exists" "true"
else
    warn_step "CHANGELOG.md missing" "Consider creating one"
fi

# 13. Vercel Configuration
echo -e "\n${BLUE}═══ 13. VERCEL CONFIGURATION ═══${NC}\n"

# Check if vercel CLI is installed
if command -v vercel &> /dev/null; then
    check_step "Vercel CLI installed" "true"

    # Check if logged in
    if vercel whoami &> /dev/null; then
        check_step "Vercel authenticated" "true"
    else
        warn_step "Vercel not authenticated" "Run: vercel login"
    fi
else
    warn_step "Vercel CLI not installed" "Run: npm i -g vercel"
fi

# 14. Final Audit
echo -e "\n${BLUE}═══ 14. FINAL DEPLOYMENT AUDIT ═══${NC}\n"

echo -e "${CYAN}Running comprehensive pre-deploy audit...${NC}\n"

if npm run pre-deploy:quick; then
    echo -e "${GREEN}  ✓ Deployment audit PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}  ✗ Deployment audit FAILED${NC}"
    ((FAILED++))
fi

# Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                           VALIDATION SUMMARY                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

# Final recommendation
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     ✅ READY FOR PRODUCTION DEPLOYMENT                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${YELLOW}Next Steps:${NC}\n"
    echo -e "1. Create release tag:"
    echo -e "   ${BLUE}npm run release:prepare ${VERSION}${NC}\n"

    echo -e "2. Push tag to GitHub:"
    echo -e "   ${BLUE}git push origin ${VERSION}${NC}\n"

    echo -e "3. Deploy to production:"
    echo -e "   ${BLUE}vercel --prod${NC}\n"

    echo -e "4. Run post-deploy smoke tests:"
    echo -e "   ${BLUE}PRODUCTION_URL=https://store.labessentials.com npm run test:smoke${NC}\n"

    echo -e "5. Monitor for 24 hours:"
    echo -e "   - Error rates"
    echo -e "   - Core Web Vitals"
    echo -e "   - Analytics parity"
    echo -e "   - Customer feedback\n"

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Note: $WARNINGS warning(s) detected. Review above and address if needed.${NC}\n"
    fi

    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                      ❌ NOT READY FOR DEPLOYMENT                           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${RED}Fix the $FAILED failed check(s) above before deploying.${NC}\n"

    exit 1
fi
