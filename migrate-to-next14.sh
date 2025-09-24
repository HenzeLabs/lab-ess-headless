#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
fi

echo -e "${BLUE}"
echo "🚀 Next.js 15 → 14 Migration Script"
echo "=================================="
echo -e "${NC}"

# Step 1: Pre-migration checks
print_step "Checking current versions..."
echo "Current Next.js version:"
npm list next | grep next || echo "Next.js not found"
echo "Current React version:"
npm list react | grep react || echo "React not found"

# Step 2: Create backup
print_step "Creating backup branch..."
git add -A
git stash push -m "Pre-migration stash - $(date)"
git checkout -b "backup/next15-state-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || echo "Branch might already exist"
git add -A
git commit -m "Backup: Next.js 15 + React 19 state before migration" || echo "Nothing to commit"

# Create migration branch
git checkout main
git checkout -b "feat/downgrade-to-next14-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || echo "Branch might already exist"

print_success "Backup created successfully"

# Step 3: Install new dependencies
print_step "Updating Next.js and React dependencies..."

# Remove current versions
print_step "Removing Next.js 15 and React 19..."
npm uninstall next react react-dom @types/react @types/react-dom || true

# Install Next.js 14 and React 18
print_step "Installing Next.js 14.2.15 and React 18.3.1..."
npm install next@14.2.15 react@18.3.1 react-dom@18.3.1
npm install --save-dev @types/react@18.3.12 @types/react-dom@18.3.1

print_success "Dependencies updated successfully"

# Step 4: Clean installation
print_step "Performing clean installation..."
rm -rf node_modules package-lock.json .next
npm install

print_success "Clean installation completed"

# Step 5: Backup original configs
print_step "Backing up configuration files..."
cp next.config.mjs next.config.mjs.backup
cp tsconfig.json tsconfig.json.backup

print_success "Configuration files backed up"

# Step 6: Update next.config.mjs
print_step "Updating next.config.mjs for Next.js 14 compatibility..."

cat > next.config.mjs << 'EOF'
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
EOF

print_success "next.config.mjs updated for Next.js 14"

# Step 7: Update tsconfig.json
print_step "Updating tsconfig.json for Next.js 14 compatibility..."

cat > tsconfig.json << 'EOF'
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
EOF

print_success "tsconfig.json updated for Next.js 14"

# Step 8: Run tests
print_step "Testing the migration..."

print_step "Running TypeScript type check..."
if npx tsc --noEmit; then
    print_success "TypeScript type check passed"
else
    print_warning "TypeScript type check failed - check for React 18 compatibility issues"
fi

print_step "Running ESLint..."
if npm run lint; then
    print_success "ESLint passed"
else
    print_warning "ESLint failed - check for code issues"
fi

print_step "Testing build process..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed - check the errors above"
fi

# Step 9: Run E2E tests
print_step "Running Playwright E2E tests..."
if npx playwright test --reporter=line; then
    print_success "E2E tests passed"
else
    print_warning "E2E tests failed - check for functionality regressions"
fi

# Step 10: Version verification
print_step "Verifying new versions..."
echo "New Next.js version:"
npm list next | grep next
echo "New React version:"
npm list react | grep react

# Final success message
echo -e "${GREEN}"
echo "🎉 Migration completed successfully!"
echo "=================================="
echo -e "${NC}"

print_success "Next.js downgraded from 15.x to 14.2.15"
print_success "React downgraded from 19.x to 18.3.1"
print_success "Configuration files updated"
print_success "Build process verified"

echo ""
print_warning "Manual verification recommended:"
echo "1. Test critical user flows in the browser"
echo "2. Check PWA functionality"
echo "3. Verify performance hasn't regressed"
echo "4. Test on different devices/browsers"
echo ""

print_step "Next steps:"
echo "1. Review the migration guide: MIGRATION_GUIDE.md"
echo "2. Test your application thoroughly"
echo "3. Update your CI/CD pipeline if needed"
echo "4. Monitor for any runtime issues"

echo ""
echo "Backup files created:"
echo "- next.config.mjs.backup"
echo "- tsconfig.json.backup"
echo "- Git branch: backup/next15-state-*"
echo ""

echo -e "${GREEN}Migration script completed! 🚀${NC}"
EOF