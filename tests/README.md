# E2E Test Suite for Next.js Headless Shopify Storefront

This directory contains comprehensive end-to-end tests using Playwright for testing critical user flows in the headless Shopify storefront.

## Test Coverage

### 🏠 Homepage Tests (`homepage.spec.ts`)

- **Performance**: LCP measurement under 2.5 seconds
- **Core Elements**: Header, navigation, hero section, footer visibility
- **SEO**: Page metadata, semantic HTML structure
- **Accessibility**: Screen reader compatibility, keyboard navigation
- **Responsiveness**: Mobile and desktop layouts
- **Error Handling**: JavaScript error detection

### 🛍️ Collections & Products Tests (`collections.spec.ts`, `products.spec.ts`)

- **Collection Browsing**: Collection page loading, card display
- **Product Navigation**: Product detail page access
- **Product Details**: Images, pricing, descriptions, variants
- **Filtering**: Collection filters and search functionality
- **Pagination**: Load more and pagination handling
- **Accessibility**: Keyboard navigation, ARIA labels

### 🛒 Cart Management Tests (`cart.spec.ts`)

- **Add to Cart**: Product addition from multiple sources
- **Quantity Updates**: Increase, decrease, direct input
- **Item Removal**: Individual item deletion
- **Cart Persistence**: Session maintenance across page refreshes
- **Cart Totals**: Pricing calculations and display
- **Empty States**: Graceful empty cart handling
- **Error Handling**: Invalid quantities, network failures

### 💳 Checkout Tests (`checkout.spec.ts`)

- **Shopify Redirect**: Proper checkout URL validation
- **Security**: HTTPS enforcement, secure cookie handling
- **Error Handling**: Network failures, invalid states
- **Accessibility**: Keyboard navigation, screen reader support
- **Analytics**: Event tracking during checkout flow

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
{
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'Mobile Chrome', use: devices['Pixel 5'] },
    { name: 'Mobile Safari', use: devices['iPhone 12'] },
  ]
}
```

### Browser Coverage

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome on Android, Safari on iOS
- **CI**: Chromium, Firefox, WebKit for comprehensive testing

## Running Tests

### Local Development

```bash
# Install Playwright browsers (first time only)
npm run test:install

# Run all E2E tests
npm run test:e2e

# Run tests with browser UI
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# Run specific test suites
npm run test:homepage
npm run test:collections
npm run test:products
npm run test:cart
npm run test:checkout

# Run core user journey tests
npm run test:core
```

### CI/CD Pipeline

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

The CI pipeline includes:

1. **Multi-browser testing** (Chromium, Firefox, WebKit)
2. **Performance testing** (LCP measurement)
3. **Mobile testing** (Chrome & Safari mobile)
4. **Test artifacts** (screenshots, videos, reports)

## Test Data Requirements

### Environment Variables

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
SHOPIFY_API_VERSION=2025-01
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Test Products

Tests expect certain test products to exist:

- `test-product`: A basic product for cart and checkout testing
- Products in collections like `microscopes` for collection testing

### Data Test IDs

The tests rely on specific `data-test-id` attributes in the components:

```typescript
// Common selectors used across tests
export const selectors = {
  header: 'header[data-test-id="header"]',
  navigation: 'nav[data-test-id="main-navigation"]',
  heroSection: 'section[data-test-id="hero-section"]',
  cartCount: '[data-test-id="cart-count"]',
  addToCartButton: '[data-test-id="add-to-cart-button"]',
  productCard: '[data-test-id="product-card"]',
  checkoutButton: '[data-test-id="checkout-button"]',
  // ... more selectors
};
```

## Performance Benchmarks

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **Page Load**: < 5 seconds for product pages
- **Network Idle**: Required before test execution

### Performance Monitoring

- Homepage LCP measurement in every test run
- Image loading optimization validation
- JavaScript error detection and reporting

## Accessibility Testing

### Standards Compliance

- WCAG 2.1 AA compliance checks
- Keyboard navigation testing
- Screen reader compatibility
- Proper ARIA labeling validation

### Test Coverage

- Skip links functionality
- Focus management
- Alternative text for images
- Form label associations

## Debugging Test Failures

### Local Debugging

```bash
# Run with debug mode for step-by-step execution
npm run test:e2e:debug

# Run with headed browser to see what's happening
npm run test:e2e:headed

# Generate and view test report
npm run test:e2e
npm run test:report
```

### CI Debugging

- Check uploaded test artifacts for screenshots and videos
- Review the GitHub Actions logs for detailed error messages
- Download playwright reports from CI artifacts

### Common Issues

1. **Timing Issues**: Tests might need `waitForPageLoad()` calls
2. **Selector Changes**: Update `data-test-id` attributes if components change
3. **Network Issues**: Verify Shopify API credentials and network connectivity
4. **Product Data**: Ensure test products exist in the Shopify store

## Adding New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageLoad, selectors } from './utils/helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
    await waitForPageLoad(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Use helper functions** for common operations
2. **Add proper waits** before assertions
3. **Include accessibility checks** where appropriate
4. **Test error states** and edge cases
5. **Keep tests independent** and deterministic

## Maintenance

### Regular Updates

- Update Playwright browsers: `npx playwright install`
- Review and update selectors when components change
- Monitor performance benchmarks and adjust thresholds
- Add tests for new features and user flows

### Monitoring

- Set up alerts for CI test failures
- Review test reports regularly
- Monitor performance trends over time
- Update test data as the product catalog changes
