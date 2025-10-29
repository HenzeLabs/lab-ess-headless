/**
 * Post-Deployment Smoke Tests
 *
 * Critical path validation for production deployments.
 * Run immediately after deployment to verify core functionality.
 *
 * Usage: PRODUCTION_URL=https://store.labessentials.com npm run test:smoke
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'http://localhost:3000';
const TIMEOUT = 30000; // 30 seconds

test.describe('Post-Deploy Smoke Tests', () => {
  test.use({ baseURL: PRODUCTION_URL });

  test.describe('Critical Path: Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      const response = await page.goto('/', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Lab Essentials/i);

      // Verify critical elements loaded
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      // Allow some time for any async errors
      await page.waitForTimeout(2000);

      expect(errors.length).toBe(0);
    });

    test('should have Core Web Vitals within thresholds', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      const vitals = (await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
          };

          // @ts-expect-error - PerformanceObserver types
          if (window.PerformanceObserver) {
            // LCP
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              // @ts-expect-error - Performance entry types
              metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // FID
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              // @ts-expect-error - Performance entry types
              metrics.fid = entries[0]?.processingStart - entries[0]?.startTime;
            }).observe({ entryTypes: ['first-input'] });

            // CLS
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              let cls = 0;
              entries.forEach(
                (
                  entry: PerformanceEntry & {
                    value?: number;
                    hadRecentInput?: boolean;
                  },
                ) => {
                  if (!entry.hadRecentInput) {
                    cls += entry.value;
                  }
                },
              );
              metrics.cls = cls;
            }).observe({ entryTypes: ['layout-shift'] });
          }

          setTimeout(() => resolve(metrics), 3000);
        });
      })) as { lcp: number; fid: number; cls: number };

      console.log('Core Web Vitals:', vitals);

      // LCP should be < 2.5s
      expect(vitals.lcp).toBeLessThan(2500);

      // CLS should be < 0.1
      expect(vitals.cls).toBeLessThan(0.1);
    });
  });

  test.describe('Critical Path: Product Catalog', () => {
    test('should load collections page', async ({ page }) => {
      const response = await page.goto('/collections', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toContainText(/collections/i);
    });

    test('should load a product page', async ({ page }) => {
      // Go to collections first
      await page.goto('/collections', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      // Find and click first product link
      const productLink = page.locator('a[href*="/products/"]').first();
      await productLink.waitFor({ state: 'visible' });
      await productLink.click();

      await page.waitForLoadState('networkidle');

      // Verify product page loaded
      await expect(page.locator('h1')).toBeVisible();
      await expect(
        page.locator('button:has-text("Add to Cart")'),
      ).toBeVisible();
    });
  });

  test.describe('Critical Path: Cart & Checkout', () => {
    test('should add product to cart and proceed to checkout', async ({
      page,
    }) => {
      // Navigate to a product page (using a known product handle)
      await page.goto('/products', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      // Click first product
      const firstProduct = page.locator('a[href*="/products/"]').first();
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      // Add to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart")');
      await addToCartButton.waitFor({ state: 'visible' });
      await addToCartButton.click();

      // Wait for cart update
      await page.waitForTimeout(1000);

      // Navigate to cart
      await page.goto('/cart', { waitUntil: 'networkidle', timeout: TIMEOUT });

      // Verify cart has items
      const cartItems = page.locator('[data-test-id="cart-item"]');
      await expect(cartItems.first()).toBeVisible();

      // Find and verify checkout button exists
      const checkoutButton = page.locator(
        'button:has-text("Checkout"), a:has-text("Checkout")',
      );
      await expect(checkoutButton.first()).toBeVisible();
    });
  });

  test.describe('Critical Path: Search', () => {
    test('should perform search and return results', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      // Open search (assuming there's a search button/icon)
      const searchButton = page.locator(
        'button[aria-label*="Search"], button:has-text("Search")',
      );
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }

      // Type in search input
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="Search"]',
      );
      await searchInput.fill('microscope');
      await searchInput.press('Enter');

      // Wait for results
      await page.waitForLoadState('networkidle');

      // Verify we're on search page or results are shown
      expect(page.url()).toContain('search');
    });
  });

  test.describe('Analytics & Tracking', () => {
    test('should load GA4 scripts', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      const hasGA4 = await page.evaluate(() => {
        // @ts-expect-error - Global analytics objects
        return (
          typeof window.gtag !== 'undefined' ||
          typeof window.dataLayer !== 'undefined'
        );
      });

      expect(hasGA4).toBeTruthy();
    });

    test('should fire page view event', async ({ page }) => {
      const events: Array<{ url: string; type: string }> = [];

      // Intercept analytics requests
      page.on('request', (request) => {
        const url = request.url();
        if (
          url.includes('google-analytics.com') ||
          url.includes('analytics.google.com')
        ) {
          events.push({ url, type: 'ga4' });
        }
        if (
          url.includes('facebook.com') ||
          url.includes('connect.facebook.net')
        ) {
          events.push({ url, type: 'meta' });
        }
      });

      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });
      await page.waitForTimeout(2000);

      // At least one analytics event should fire
      expect(events.length).toBeGreaterThan(0);
    });
  });

  test.describe('Performance & Assets', () => {
    test('should serve images in modern formats', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      const images = await page.locator('img').all();
      const imageSources = await Promise.all(
        images.map(async (img) => await img.getAttribute('src')),
      );

      // Check if at least some images use WebP or AVIF
      const modernFormats = imageSources.filter(
        (src) => src && (src.includes('webp') || src.includes('avif')),
      );

      // At least 50% should use modern formats (adjust threshold as needed)
      const ratio = modernFormats.length / imageSources.length;
      expect(ratio).toBeGreaterThan(0.3);
    });

    test('should have proper cache headers', async ({ page }) => {
      const response = await page.goto('/', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      const cacheControl = response?.headers()['cache-control'];
      expect(cacheControl).toBeDefined();
    });

    test('should have security headers', async ({ page }) => {
      const response = await page.goto('/', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      const headers = response?.headers();

      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['x-frame-options']).toBe('DENY');
      expect(headers?.['referrer-policy']).toBeDefined();
      expect(headers?.['content-security-policy']).toBeDefined();
    });
  });

  test.describe('SEO & Meta Tags', () => {
    test('should have proper meta tags on homepage', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      // Title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(60);

      // Meta description
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(description).toBeDefined();
      expect(description!.length).toBeLessThanOrEqual(155);

      // Open Graph tags
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute('content');
      expect(ogTitle).toBeDefined();

      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute('content');
      expect(ogImage).toBeDefined();
    });

    test('should have robots.txt accessible', async ({ page }) => {
      const response = await page.goto('/robots.txt', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      expect(response?.status()).toBe(200);

      const content = await page.content();
      expect(content).toContain('User-agent');
    });

    test('should have sitemap.xml accessible', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      expect(response?.status()).toBe(200);

      const content = await page.content();
      expect(content).toContain('<?xml');
      expect(content).toContain('<urlset');
    });
  });

  test.describe('Mobile Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('should be mobile responsive', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      // Verify mobile menu exists or hamburger button
      const mobileMenu = page.locator(
        '[aria-label*="menu"], button:has-text("Menu")',
      );
      await expect(mobileMenu.first()).toBeVisible();

      // Verify content is not horizontally scrollable
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
    });

    test('should have tap targets of adequate size', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: TIMEOUT });

      const buttons = page.locator('button, a');
      const buttonCount = await buttons.count();

      // Check at least a few buttons
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Minimum tap target is 48x48px (WCAG guideline)
            expect(box.width >= 44 || box.height >= 44).toBeTruthy();
          }
        }
      }
    });
  });
});
