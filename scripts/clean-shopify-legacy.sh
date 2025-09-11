#!/bin/bash

echo "🔍 Starting Shopify legacy cleanup..."

FILES_TO_DELETE=(
  "src/components/Bestsellers.tsx"
  "src/components/BrandValues.tsx"
  "src/components/StickyHeader.tsx"
  "src/components/CustomerReviews.tsx"
  "src/components/FAQ.tsx"
  "src/components/AxeA11yScript.tsx"
  "src/components/AxeA11yScriptClient.tsx"
  "src/components/Hero.tsx"
  "src/components/Icons.tsx"
  "src/components/CollectionFilters.tsx"
  "src/app/page.tsx"
  "src/app/loading.tsx"
  # Add more files as you confirm they are unused
)

for FILE in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$FILE" ]; then
    echo "🗑️ Deleting $FILE"
    rm "$FILE"
  else
    echo "✅ Skipped (not found): $FILE"
  fi
done

# Remove unused queries from queries.ts
echo "🧠 Cleaning unused queries from queries.ts..."
sed -i '' '/getProductsQuery/d' src/lib/queries.ts
sed -i '' '/createCartMutation/d' src/lib/queries.ts
sed -i '' '/getCollectionByHandleQuery/d' src/lib/queries.ts

echo "✅ Cleanup complete!"
