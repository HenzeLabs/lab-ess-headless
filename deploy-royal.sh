#!/bin/bash

# Royal Deployment Script - Make your app worthy of kings and queens! 👑

echo "🚀 Starting Royal E-commerce Deployment..."

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf public/sw.js*
rm -rf public/workbox-*

# 2. Install dependencies with exact versions for stability
echo "📦 Installing production dependencies..."
npm ci --production=false

# 3. Type checking
echo "🔍 Running TypeScript checks..."
npm run typecheck

# 4. Linting with zero warnings tolerance
echo "✨ Linting code (zero warnings)..."
npm run lint

# 5. Run critical tests
echo "🧪 Running critical E2E tests..."
npm run test:core

# 6. Build optimized production bundle
echo "🏗️  Building optimized production bundle..."
NODE_ENV=production npm run build

# 7. Lighthouse performance audit
echo "⚡ Running Lighthouse performance audit..."
if command -v lighthouse >/dev/null 2>&1; then
    # Start the production server in background
    PORT=3001 npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Run Lighthouse audit
    lighthouse http://localhost:3001 \
        --output=json \
        --output=html \
        --output-path=./lighthouse-production \
        --chrome-flags="--headless --no-sandbox" \
        --only-categories=performance,accessibility,best-practices,seo \
        --form-factor=mobile
    
    # Kill the server
    kill $SERVER_PID
else
    echo "⚠️  Lighthouse not installed. Install with: npm install -g lighthouse"
fi

# 8. Bundle analysis
echo "📊 Analyzing bundle size..."
ANALYZE=true npm run build

# 9. Security check
echo "🔒 Running security audit..."
npm audit --audit-level=high

# 10. Final validation
echo "✅ Running final validation tests..."
npm run test:homepage

echo "👑 Royal Deployment Complete! Your app is ready for kings and queens!"
echo "📊 Check lighthouse-production.html for performance metrics"
echo "🚀 Deploy with: npm start"