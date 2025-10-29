#!/bin/bash
#
# Automated Quiz Validation Pipeline
#
# This script:
# 1. Exports products from Shopify
# 2. Runs validation tests
# 3. Optimizes weights if needed
# 4. Generates reports
#

set -e

echo "🔬 Microscope Quiz Validation Pipeline"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables from parent directory
if [ -f "../.env.local" ]; then
    echo "Loading environment variables..."
    export $(grep -v '^#' ../.env.local | grep SHOPIFY | xargs)
    echo -e "${GREEN}✓ Environment loaded${NC}"
    echo ""
fi

# Step 1: Export products
echo -e "${YELLOW}Step 1: Exporting Shopify products...${NC}"
node export_products.js

if [ ! -f "products_export.json" ]; then
    echo -e "${RED}❌ Product export failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Products exported successfully${NC}"
echo ""

# Step 2: Check if Python or TypeScript validator
echo -e "${YELLOW}Step 2: Running validation...${NC}"

if command -v python3 &> /dev/null; then
    echo "Using Python validator..."
    python3 quiz_validator.py
elif command -v tsx &> /dev/null; then
    echo "Using TypeScript validator..."
    tsx quiz_validator.ts
else
    echo -e "${RED}❌ Neither Python3 nor tsx found${NC}"
    echo "Install Python 3 or run: npm install -g tsx"
    exit 1
fi

echo -e "${GREEN}✓ Validation complete${NC}"
echo ""

# Step 3: Display results
echo -e "${YELLOW}Step 3: Displaying results...${NC}"
echo ""

if [ -f "initial_validation_report.txt" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "INITIAL VALIDATION RESULTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    head -20 initial_validation_report.txt
    echo ""
fi

if [ -f "optimized_validation_report.txt" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "OPTIMIZED VALIDATION RESULTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    head -20 optimized_validation_report.txt
    echo ""
fi

if [ -f "optimized_weights.json" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "OPTIMIZED WEIGHTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat optimized_weights.json
    echo ""
    echo ""
    echo -e "${GREEN}✓ Copy these weights to: src/components/quiz/MicroscopeQuiz.tsx${NC}"
fi

# Step 4: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VALIDATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Generated files:"
echo "  ✓ products_export.json"
echo "  ✓ initial_validation_report.txt"

if [ -f "optimized_validation_report.txt" ]; then
    echo "  ✓ optimized_validation_report.txt"
fi

if [ -f "optimized_weights.json" ]; then
    echo "  ✓ optimized_weights.json"
fi

echo ""
echo "Next steps:"
echo "  1. Review validation reports"
echo "  2. Update quiz weights in MicroscopeQuiz.tsx"
echo "  3. Test manually at /quiz"
echo "  4. Deploy to production"
echo ""
echo -e "${GREEN}✅ All done!${NC}"
