# Next.js 15 → 14 Downgrade Migration Guide

## Overview

This guide provides step-by-step instructions to safely downgrade from Next.js 15.5.2 to the latest stable Next.js 14.x, including React 19 → 18 downgrade and configuration updates.

## Pre-Migration Checklist

### 1. Current State Analysis

- ✅ Next.js: 15.5.3 (unstable)
- ✅ React: 19.1.0 (incompatible with Next.js 14)
- ✅ React DOM: 19.1.0
- ✅ TypeScript: Latest
- ✅ App Router: In use
- ✅ PWA: next-pwa@5.6.0
- ✅ Webpack customizations: Present

### 2. Backup Current State

```bash
# Create backup branch
git checkout -b backup/next15-state
git add -A
git commit -m "Backup: Next.js 15.5.3 + React 19 state"
git checkout main

# Create feature branch for migration
git checkout -b feat/downgrade-to-next14
```

## Step 1: Update package.json Dependencies

### Core Dependencies to Change

```bash
# Remove current Next.js and React versions
npm uninstall next react react-dom

# Install Next.js 14 stable with React 18
npm install next@^14.2.15 react@^18.3.1 react-dom@^18.3.1

# Update TypeScript types for React 18
npm install --save-dev @types/react@^18.3.12 @types/react-dom@^18.3.1
```

### Updated package.json Dependencies

Replace these sections in your package.json:

```json
{
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1"
  }
}
```

### Check next-pwa Compatibility

```bash
# Check if current next-pwa works with Next.js 14
npm list next-pwa

# If issues arise, may need to update or downgrade
# npm install next-pwa@^5.6.0
```

## Step 2: Update next.config.mjs

### Remove Next.js 15 Specific Features

Replace your current `next.config.mjs`:

```javascript
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // CHANGED: Revert to experimental for Next.js 14
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@google-analytics/data',
    ],
    // REMOVED: turbopack (use legacy experimental.turbo if needed)
  },

  // REMOVED: Top-level turbopack config (Next.js 15 feature)
  // Use this instead if you need Turbopack:
  // experimental: {
  //   turbo: {
  //     rules: {
  //       '*.svg': {
  //         loaders: ['@svgr/webpack'],
  //         as: '*.js',
  //       },
  //     },
  //   },
  // },

  // Image optimization (unchanged)
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['cdn.shopify.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Headers (unchanged)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },

  // Webpack optimizations (simplified for Next.js 14)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting (compatible with Next.js 14)
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const identifier = module.identifier();
              return (
                identifier.split('/').pop()?.split('.')[0]?.substring(0, 8) ||
                'chunk'
              );
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: 'shared',
            minChunks: 1,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: '/sw.js',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.shopify\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'shopify-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

export default withPWAConfig(nextConfig);
```

## Step 3: Update tsconfig.json

### ModuleResolution Change

Update `tsconfig.json` for Next.js 14 compatibility:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "playwright.config.ts",
    "value-props.tsx",
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "postcss.config.js",
    "tailwind.config.js"
  ],
  "exclude": ["node_modules"]
}
```

**Key change:** `"moduleResolution": "bundler"` → `"moduleResolution": "node"`

## Step 4: React 19 → 18 Code Changes

### React 18 Compatibility Updates

#### 1. Update Root Rendering (if using createRoot)

If you have custom root rendering, update it:

```typescript
// Before (React 19)
import { createRoot } from 'react-dom/client';

// After (React 18) - No changes needed, but ensure compatibility
import { createRoot } from 'react-dom/client';
```

#### 2. Remove React 19 Specific Features

Check for and remove:

- `use()` hook (React 19 feature)
- Form actions with automatic form submission
- New React 19 APIs

#### 3. Update Component Props

React 18 may require explicit typing for some props:

```typescript
// Ensure proper typing for React 18
interface ComponentProps {
  children: React.ReactNode;
  // ... other props
}
```

## Step 5: Test Dependencies Compatibility

### Check Third-Party Package Compatibility

```bash
# Test critical dependencies
npm ls @radix-ui/react-dialog
npm ls framer-motion
npm ls @tanstack/react-query
npm ls lucide-react

# Update incompatible packages if needed
npm update @testing-library/react
```

### Update Playwright Tests for React 18

Review test files for React 19 specific testing patterns:

- `tests/homepage.spec.ts`
- `tests/collections.spec.ts`
- `tests/products.spec.ts`
- `tests/cart.spec.ts`
- `tests/checkout.spec.ts`

## Step 6: Migration Commands

### Complete Migration Script

```bash
#!/bin/bash
set -e

echo "🚀 Starting Next.js 15 → 14 migration..."

# 1. Backup current state
git add -A
git commit -m "Pre-migration checkpoint"

# 2. Update dependencies
echo "📦 Updating dependencies..."
npm uninstall next react react-dom @types/react @types/react-dom
npm install next@^14.2.15 react@^18.3.1 react-dom@^18.3.1
npm install --save-dev @types/react@^18.3.12 @types/react-dom@^18.3.1

# 3. Clean install
echo "🧹 Clean install..."
rm -rf node_modules package-lock.json
npm install

# 4. Update configs (manual step - see above)
echo "⚙️  Please update next.config.mjs and tsconfig.json manually"

# 5. Build test
echo "🔨 Testing build..."
npm run build

# 6. Type check
echo "🔍 Type checking..."
npm run typecheck

# 7. Lint check
echo "📝 Linting..."
npm run lint

# 8. Run tests
echo "🧪 Running tests..."
npm run test:core

echo "✅ Migration complete!"
```

## Step 7: Files Likely to Break

### High Risk Files

1. **next.config.mjs** ⚠️ Critical

   - Remove turbopack top-level config
   - Move optimizations to experimental
   - Check webpack config compatibility

2. **tsconfig.json** ⚠️ Critical

   - Change moduleResolution from "bundler" to "node"

3. **Components using React 19 features** ⚠️ Medium

   - Remove `use()` hook usage
   - Check form action implementations
   - Review server components

4. **API Routes** ⚠️ Low
   - Verify App Router API routes still work
   - Check request/response handling

### Medium Risk Files

1. **Middleware** (`middleware.ts`)
   - Verify Next.js 14 middleware compatibility
2. **App Router Files**

   - `src/app/layout.tsx`
   - `src/app/page.tsx`
   - Route handlers in `src/app/api/`

3. **Error Boundaries**
   - `src/app/error.tsx`
   - `src/app/global-error.tsx`

### Low Risk Files

1. **Components** (most should work)
2. **Utility functions**
3. **Static assets**
4. **Styles**

## Step 8: Testing Checklist

### Functional Testing

- [ ] Homepage loads correctly
- [ ] Collections page works
- [ ] Product pages display properly
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] PWA functionality intact
- [ ] Image optimization working

### Performance Testing

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify bundle sizes haven't regressed
- [ ] Test PWA offline functionality

### Development Testing

- [ ] `npm run dev` starts successfully
- [ ] Hot reload works
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Build process completes
- [ ] All tests pass

### Browser Testing

- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Chrome mobile
- [ ] Safari mobile

## Step 9: Post-Migration Verification

### Performance Comparison

```bash
# Before migration (save results)
npm run lh

# After migration (compare)
npm run lh

# Compare bundle sizes
npm run build
npm run analyze
```

### Monitoring Checklist

- [ ] Build time comparison
- [ ] Bundle size analysis
- [ ] Runtime performance
- [ ] Error monitoring (check console)
- [ ] CI/CD pipeline passes

## Rollback Plan

If issues occur:

```bash
# Quick rollback
git checkout backup/next15-state
git checkout -b rollback/restore-next15

# Or specific rollback
git revert <migration-commit-hash>
```

## Common Issues & Solutions

### Issue: Build Fails with Module Resolution

```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run build
```

### Issue: React Types Mismatch

```bash
# Solution: Ensure consistent React 18 types
npm install --save-dev @types/react@^18.3.12 @types/react-dom@^18.3.1
```

### Issue: PWA Not Working

```bash
# Solution: Check next-pwa compatibility
npm uninstall next-pwa
npm install next-pwa@^5.6.0
```

### Issue: Turbopack Errors

```bash
# Solution: Disable turbopack temporarily
# Remove turbopack config from next.config.mjs
```

## Success Criteria

Migration is successful when:

1. ✅ All builds pass without errors
2. ✅ All tests pass (unit + E2E)
3. ✅ Performance metrics maintained
4. ✅ PWA functionality preserved
5. ✅ No runtime errors in console
6. ✅ CI/CD pipeline passes
7. ✅ Core user flows work correctly
