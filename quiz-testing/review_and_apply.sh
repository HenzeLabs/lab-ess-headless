#!/bin/bash
#
# Interactive Metafield Review & Apply
#
# Reviews each product and lets you approve or edit metafields
#

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔬 Interactive Metafield Review${NC}"
echo "========================================"
echo ""

if [ ! -f "metafields_template.csv" ]; then
    echo -e "${RED}❌ metafields_template.csv not found${NC}"
    echo "Run: node generate_metafield_template.js"
    exit 1
fi

# Read CSV and display each product
tail -n +2 metafields_template.csv | while IFS=',' read -r id title type features applications specs category; do
    # Remove quotes
    title=$(echo "$title" | tr -d '"')
    features=$(echo "$features" | tr -d '"')
    applications=$(echo "$applications" | tr -d '"')
    specs=$(echo "$specs" | tr -d '"')

    clear
    echo -e "${BLUE}────────────────────────────────────────${NC}"
    echo -e "${YELLOW}📦 $title${NC}"
    echo -e "${BLUE}────────────────────────────────────────${NC}"
    echo ""
    echo -e "${GREEN}Type:${NC} $type"
    echo -e "${GREEN}Category:${NC} $category"
    echo ""
    echo -e "${GREEN}Features:${NC}"
    echo "$features" | tr '|' '\n' | sed 's/^/  • /'
    echo ""
    echo -e "${GREEN}Applications:${NC}"
    echo "$applications" | tr '|' '\n' | sed 's/^/  • /'
    echo ""
    echo -e "${GREEN}Specs:${NC}"
    echo "$specs" | tr '|' '\n' | sed 's/^/  • /'
    echo ""
    echo -e "${BLUE}────────────────────────────────────────${NC}"
    echo ""
    echo "Options:"
    echo "  [y] Approve and continue"
    echo "  [e] Edit in CSV and re-run"
    echo "  [s] Skip this product"
    echo "  [q] Quit"
    echo ""
    read -p "Choice: " choice

    case $choice in
        y|Y)
            echo -e "${GREEN}✓ Approved${NC}"
            sleep 1
            ;;
        e|E)
            echo -e "${YELLOW}Opening CSV for editing...${NC}"
            open metafields_template.csv 2>/dev/null || xdg-open metafields_template.csv 2>/dev/null || nano metafields_template.csv
            echo ""
            echo "After editing, save and re-run this script"
            exit 0
            ;;
        s|S)
            echo -e "${YELLOW}⏭️  Skipped${NC}"
            sleep 1
            ;;
        q|Q)
            echo -e "${RED}Cancelled${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            sleep 2
            ;;
    esac
done

echo ""
echo -e "${GREEN}✅ Review complete!${NC}"
echo ""
echo "Ready to apply metafields to Shopify?"
read -p "Apply now? (y/n): " apply

if [ "$apply" = "y" ] || [ "$apply" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}📤 Applying metafields to Shopify...${NC}"
    node apply_metafields.js
else
    echo -e "${YELLOW}Not applied. Run 'node apply_metafields.js' when ready.${NC}"
fi
