import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  measureLCP,
  expectPageAccessible,
  selectors,
} from './utils/helpers';

test.describe('Homepage Performance & Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should load homepage with LCP under 2.5 seconds', async ({ page }) => {
    // Measure Largest Contentful Paint
    const lcpTime = await measureLCP(page);

    // Assert LCP is under 2.5 seconds (2500ms)
    expect(lcpTime).toBeLessThan(2500);

    // Log the actual LCP time for debugging
    console.log(`LCP time: ${lcpTime}ms`);
  });

  test('should display core page elements', async ({ page }) => {
    // Check essential page elements are visible
    await expect(page.locator(selectors.header)).toBeVisible();
    await expect(page.locator(selectors.heroSection)).toBeVisible();
    await expect(page.locator(selectors.footer)).toBeVisible();

    // Check main content is accessible
    await expectPageAccessible(page);
  });

  test('should have proper page metadata', async ({ page }) => {
    // Check page title
    const title = await page.title();
    expect(title).toContain('Lab Essentials');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Lab Essentials/);

    // Check canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\//);
  });

  test('should have navigation menu', async ({ page }) => {
    const navigation = page.locator(selectors.navigation);
    await expect(navigation).toBeVisible();

    // Check for navigation items (links or buttons)
    const navItems = navigation.locator('a, button');
    const itemCount = await navItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Verify at least one navigation item (could be button or link)
    const firstNavItem = navItems.first();
    await expect(firstNavItem).toBeVisible();
  });

  test('should display hero section with CTA', async ({ page }) => {
    const heroSection = page.locator(selectors.heroSection);
    await expect(heroSection).toBeVisible();

    // Check for hero title
    const heroTitle = heroSection.locator('h1');
    await expect(heroTitle).toBeVisible();

    // Check for CTA buttons
    const ctaButtons = heroSection.locator('a, button');
    const buttonCount = await ctaButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should display featured products section', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-test-id="product-card"]', {
      timeout: 10000,
    });

    const productCards = page.locator(selectors.productCard);
    const productCount = await productCards.count();

    // Should have at least one featured product
    expect(productCount).toBeGreaterThan(0);

    // Check first product card has required elements
    if (productCount > 0) {
      const firstProduct = productCards.first();
      await expect(firstProduct.locator('img')).toBeVisible();
      await expect(firstProduct.locator('a').first()).toHaveAttribute(
        'href',
        /\/products\//,
      );
    }
  });

  test('should have cart functionality in header', async ({ page }) => {
    // Check cart button exists
    const cartButton = page.locator(selectors.cartButton);
    await expect(cartButton).toBeVisible();

    // Cart count should be visible (even if 0)
    const cartCount = page.locator(selectors.cartCount);
    await expect(cartCount).toBeVisible();
  });

  test('should be mobile responsive', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile-specific elements
      const mobileNav = page.locator('[data-test-id="mobile-menu-button"]');
      await expect(mobileNav).toBeVisible();

      // Ensure content is not horizontally scrollable
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 0;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
    }
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    // Check for proper landmarks
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for skip to content link
    const skipLink = page.locator('a[href="#main-content"]').first();
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toHaveText(/skip/i);
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await waitForPageLoad(page);

    // Filter out known acceptable errors/warnings
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('Hydration') &&
        !error.includes('Warning:') &&
        !error.includes('favicon'),
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
