# CI/CD Pipeline Documentation

## Overview

This repository uses a comprehensive CI/CD pipeline that ensures code quality, performance, and reliability before deployment. The pipeline includes automated testing, performance audits, security checks, and deployment readiness validation.

## Pipeline Structure

### 🔄 Trigger Events

- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main` or `develop` branches

### 🏗️ Pipeline Jobs

#### 1. Code Quality & Type Safety

**Duration:** ~2-3 minutes  
**Purpose:** Fast feedback on code quality issues

- ✅ TypeScript compilation check (`npm run typecheck`)
- ✅ ESLint code quality checks (`npm run lint`)
- ✅ Dependency installation with caching
- ✅ Build file caching for subsequent jobs

#### 2. Build Application

**Duration:** ~3-5 minutes  
**Purpose:** Ensure application builds successfully

- ✅ Next.js production build (`npm run build`)
- ✅ Build artifact caching and uploading
- ✅ Environment variable validation
- ✅ Static asset optimization verification

#### 3. E2E Tests (Playwright)

**Duration:** ~5-8 minutes per browser  
**Purpose:** Validate critical user journeys

**Browser Matrix:**

- Chromium (Chrome-based browsers)
- Firefox

**Test Coverage:**

- Homepage performance (LCP < 2.5s)
- User browsing (collections, products)
- Cart management (add, update, remove)
- Checkout flow validation
- Cross-browser compatibility

#### 4. Performance Audit (Lighthouse)

**Duration:** ~3-5 minutes  
**Purpose:** Ensure performance standards

**Audit Targets:**

- Homepage (`/`)
- Collections page (`/collections`)
- Product page (`/products/test-product`)
- Cart page (`/cart`)

**Performance Thresholds:**

- Performance Score: ≥ 80
- Accessibility Score: ≥ 90
- Best Practices Score: ≥ 80
- SEO Score: ≥ 90
- LCP: ≤ 2.5 seconds
- CLS: ≤ 0.1

#### 5. Security & Dependency Audit

**Duration:** ~1-2 minutes  
**Purpose:** Identify security vulnerabilities

- ✅ NPM security audit
- ✅ High-severity vulnerability detection
- ✅ Dependency health checks

#### 6. Deployment Readiness

**Duration:** ~1 minute  
**Purpose:** Final validation and summary

- ✅ All job results validation
- ✅ Deployment readiness report
- ✅ Quality gate summary

## 📊 Artifacts & Reports

### Automatic Artifact Collection

#### Playwright Reports

- **Path:** `playwright-report/`, `test-results/`
- **Retention:** 7 days
- **Content:** Test results, screenshots, videos, traces
- **Access:** Download from GitHub Actions artifacts

#### Lighthouse Reports

- **Path:** `.lighthouseci/`, `lighthouse-reports/`
- **Retention:** 7 days
- **Content:** Performance metrics, audit results, recommendations
- **Access:** Download from GitHub Actions artifacts

#### Build Artifacts

- **Path:** `.next/`, `public/`
- **Retention:** 1 day
- **Content:** Compiled application, static assets
- **Usage:** Shared between jobs for consistency

## 🔒 Required Secrets

Configure these secrets in GitHub repository settings:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

**Setting up secrets:**

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret with the appropriate value

## 🛠️ Local Development

### Running Tests Locally

```bash
# Install dependencies
npm ci

# Run quality checks (same as CI)
npm run typecheck
npm run lint

# Build application
npm run build

# Run E2E tests
npm run test:core

# Run Lighthouse audit (requires lighthouse.config.js)
npm run lh
```

### Debugging CI Failures

#### Playwright Test Failures

```bash
# Run tests in headed mode to see browser
npm run test:e2e:headed

# Run tests with UI for debugging
npm run test:e2e:ui

# Run specific test file
npm run test:homepage
```

#### Build Failures

```bash
# Check TypeScript errors
npm run typecheck

# Check linting issues
npm run lint

# Attempt build locally
npm run build
```

#### Performance Issues

```bash
# Run Lighthouse locally
npm run lh

# Check Core Web Vitals
# Use Chrome DevTools → Lighthouse tab
```

## 📈 Performance Monitoring

### Core Web Vitals Tracking

- **LCP (Largest Contentful Paint):** ≤ 2.5s
- **FID (First Input Delay):** ≤ 100ms
- **CLS (Cumulative Layout Shift):** ≤ 0.1

### Performance Budget

- **JavaScript Bundle:** Monitor for significant increases
- **Image Optimization:** Automated WebP conversion
- **Critical CSS:** Inlined for above-the-fold content

## 🚨 Troubleshooting Common Issues

### TypeScript Errors

```bash
# Check for type errors
npm run typecheck

# Common fixes:
# - Update type definitions
# - Fix import statements
# - Resolve module resolution issues
```

### Lint Failures

```bash
# Auto-fix lint issues
npm run lint -- --fix

# Common issues:
# - Unused imports
# - Missing semicolons
# - Code formatting
```

### Build Failures

```bash
# Common causes:
# - Missing environment variables
# - Import/export issues
# - Asset optimization problems

# Debug steps:
npm run build -- --debug
```

### Playwright Test Failures

```bash
# Common causes:
# - Timing issues (add more waits)
# - Selector changes (update data-test-ids)
# - Network issues (check API connectivity)

# Debug steps:
npm run test:e2e:debug
```

### Lighthouse Audit Failures

```bash
# Common causes:
# - Performance regression
# - Accessibility issues
# - SEO problems

# Debug steps:
# Run Chrome DevTools Lighthouse locally
```

## 🔄 Pipeline Optimization

### Caching Strategy

- **NPM dependencies:** Cached between runs
- **Next.js build cache:** Shared across jobs
- **Playwright browsers:** Installed per job (matrix strategy)

### Parallelization

- **Quality checks:** Run first for fast feedback
- **Browser tests:** Matrix strategy for parallel execution
- **Build artifacts:** Shared to avoid rebuilding

### Performance Improvements

- **Selective test running:** Core tests only on develop branch
- **Artifact sharing:** Avoid duplicate builds
- **Smart caching:** Version-aware cache keys

## 📝 Branch Protection

See [BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md) for detailed branch protection setup to ensure:

- All CI checks pass before merging
- Code review requirements
- Branch currency enforcement
- Administrative compliance

## 🚀 Deployment Integration

This CI pipeline prepares code for deployment by ensuring:

1. **Code Quality:** TypeScript + ESLint validation
2. **Build Success:** Production build verification
3. **User Experience:** E2E journey testing
4. **Performance:** Core Web Vitals compliance
5. **Security:** Vulnerability scanning
6. **Cross-browser:** Multi-browser compatibility

After successful CI completion, the code is ready for deployment to staging or production environments.
