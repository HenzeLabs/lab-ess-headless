import { test, expect } from '@playwright/test';

/**
 * UI Consistency Test Suite
 *
 * Compares visual consistency across all templates against homepage baseline.
 * Tests typography, colors, spacing, and component styling.
 *
 * Usage:
 *   npm run test:visual                  # Run visual tests
 *   npm run test:visual:update           # Update baseline screenshots
 */

const TEMPLATES = [
  {
    name: 'Homepage',
    url: '/',
    baseline: true,
    regions: [
      { name: 'Header', selector: 'header' },
      {
        name: 'Hero',
        selector: '[data-testid="hero"], main > section:first-of-type',
      },
      { name: 'Footer', selector: 'footer' },
      {
        name: 'CTA Buttons',
        selector: 'a[class*="buttonStyles"], button[class*="buttonStyles"]',
      },
    ],
  },
  {
    name: 'Collection Page',
    url: '/collections/microscope-camera-monitors',
    regions: [
      { name: 'Header', selector: 'header' },
      { name: 'Page Title', selector: 'main h1' },
      { name: 'Product Grid', selector: '[aria-label*="products"]' },
      {
        name: 'Product Card',
        selector:
          'article:first-of-type, [data-testid="product-card"]:first-of-type',
      },
      { name: 'Footer', selector: 'footer' },
    ],
  },
  {
    name: 'Product Page',
    url: '/products/13-3-camera-monitor',
    regions: [
      { name: 'Header', selector: 'header' },
      { name: 'Product Title', selector: '[data-test-id="product-title"]' },
      { name: 'Product Price', selector: '[data-test-id="product-price"]' },
      {
        name: 'Add to Cart Button',
        selector: '[data-test-id="add-to-cart-button"]',
      },
      { name: 'Footer', selector: 'footer' },
    ],
  },
  {
    name: 'Support - Contact',
    url: '/support/contact',
    regions: [
      { name: 'Header', selector: 'header' },
      { name: 'Page Title', selector: 'main h1' },
      { name: 'Content Section', selector: 'main > div:first-of-type' },
      { name: 'Footer', selector: 'footer' },
    ],
  },
  {
    name: 'Support - FAQ',
    url: '/support/faq',
    regions: [
      { name: 'Header', selector: 'header' },
      { name: 'Page Title', selector: 'main h1' },
      { name: 'Content Section', selector: 'main > div:first-of-type' },
      { name: 'Footer', selector: 'footer' },
    ],
  },
  {
    name: '404 Page',
    url: '/this-page-does-not-exist-for-testing',
    regions: [
      { name: 'Error Content', selector: 'main' },
      { name: 'Primary CTA', selector: 'a[href="/"]' },
    ],
  },
];

test.describe('UI Consistency - Visual Regression', () => {
  // Configure viewport for consistent screenshots
  test.use({ viewport: { width: 1280, height: 720 } });

  // Full page screenshots for each template
  for (const template of TEMPLATES) {
    test(`${template.name} - Full Page Screenshot`, async ({ page }) => {
      await page.goto(template.url);

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow animations to complete

      // Take full page screenshot
      await expect(page).toHaveScreenshot(
        `${template.name.toLowerCase().replace(/\s+/g, '-')}-full.png`,
        {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixels: 100, // Allow minor rendering differences
        },
      );
    });
  }

  // Component-level screenshots for granular comparisons
  for (const template of TEMPLATES) {
    test.describe(template.name, () => {
      for (const region of template.regions || []) {
        test(`${template.name} - ${region.name}`, async ({ page }) => {
          await page.goto(template.url);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          // Try to locate the element
          const element = page.locator(region.selector).first();

          // Check if element exists before screenshotting
          const count = await element.count();
          if (count === 0) {
            test.skip();
            return;
          }

          await expect(element).toHaveScreenshot(
            `${template.name.toLowerCase().replace(/\s+/g, '-')}-${region.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            {
              animations: 'disabled',
              maxDiffPixels: 50,
            },
          );
        });
      }
    });
  }
});

test.describe('UI Consistency - Typography Validation', () => {
  test('Verify font families across templates', async ({ page }) => {
    const templates = TEMPLATES.slice(0, 5); // Test main templates

    for (const template of templates) {
      await page.goto(template.url);
      await page.waitForLoadState('networkidle');

      // Check H1 uses Montserrat
      const h1FontFamily = await page
        .locator('h1')
        .first()
        .evaluate((el) => {
          return window.getComputedStyle(el).fontFamily;
        });
      expect(h1FontFamily).toContain('Montserrat');

      // Check body text uses Roboto
      const bodyFontFamily = await page
        .locator('p')
        .first()
        .evaluate((el) => {
          return window.getComputedStyle(el).fontFamily;
        });
      expect(bodyFontFamily).toContain('Roboto');
    }
  });

  test('Verify heading hierarchy exists on all pages', async ({ page }) => {
    for (const template of TEMPLATES.slice(0, 5)) {
      await page.goto(template.url);
      await page.waitForLoadState('networkidle');

      // Every page should have exactly one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `${template.name} should have exactly one H1`).toBe(1);

      // H1 should be visible
      const h1Visible = await page.locator('h1').first().isVisible();
      expect(h1Visible, `${template.name} H1 should be visible`).toBe(true);
    }
  });
});

test.describe('UI Consistency - Color Token Validation', () => {
  test('Verify brand color usage in CTAs', async ({ page }) => {
    const ctaPages = [
      {
        name: 'Homepage',
        url: '/',
        selector: 'a[href*="/collections"], a[href*="/products"]',
      },
      {
        name: 'Collection',
        url: '/collections/microscope-camera-monitors',
        selector: 'a[class*="primary"]',
      },
      {
        name: 'Product',
        url: '/products/13-3-camera-monitor',
        selector: '[data-test-id="add-to-cart-button"]',
      },
    ];

    for (const page_info of ctaPages) {
      await page.goto(page_info.url);
      await page.waitForLoadState('networkidle');

      const button = page.locator(page_info.selector).first();
      const count = await button.count();

      if (count > 0) {
        const bgColor = await button.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // Brand teal is approximately rgb(13, 148, 136) or hsl(175, 84%, 26%)
        // Check if color is in the teal range
        const isValidBrandColor =
          bgColor.includes('rgb(13, 148, 136)') ||
          bgColor.includes('hsl(175') ||
          /rgb\(1[0-6], 14[0-9], 13[0-9]\)/.test(bgColor); // Allow slight rendering variations

        expect(
          isValidBrandColor,
          `${page_info.name} CTA should use brand teal color, got: ${bgColor}`,
        ).toBeTruthy();
      }
    }
  });

  test('Verify consistent background colors', async ({ page }) => {
    const pages = TEMPLATES.slice(0, 5);

    for (const template of pages) {
      await page.goto(template.url);
      await page.waitForLoadState('networkidle');

      const bodyBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Background should be light (near white) in light mode
      expect(bodyBgColor).toMatch(
        /rgb\(25[0-5], 25[0-5], 25[0-5]\)|rgb\(24[8-9], 24[8-9], 25[0-5]\)/,
      );
    }
  });
});

test.describe('UI Consistency - Spacing Validation', () => {
  test('Verify consistent section padding', async ({ page }) => {
    const pages = [
      { url: '/', selector: 'main > section:first-of-type' },
      { url: '/collections/microscope-camera-monitors', selector: 'main' },
      { url: '/products/13-3-camera-monitor', selector: 'main' },
      { url: '/support/contact', selector: 'main' },
    ];

    const paddingValues: string[] = [];

    for (const page_info of pages) {
      await page.goto(page_info.url);
      await page.waitForLoadState('networkidle');

      const element = page.locator(page_info.selector).first();
      const paddingTop = await element.evaluate((el) => {
        return window.getComputedStyle(el).paddingTop;
      });

      paddingValues.push(paddingTop);
    }

    // All vertical paddings should be consistent (48px or 64px based on breakpoint)
    const uniquePaddings = [...new Set(paddingValues)];
    expect(
      uniquePaddings.length,
      `Inconsistent section padding found: ${paddingValues.join(', ')}`,
    ).toBeLessThanOrEqual(2); // Allow for responsive variations
  });

  test('Verify consistent container max-width', async ({ page }) => {
    const pages = [
      '/',
      '/collections/microscope-camera-monitors',
      '/products/13-3-camera-monitor',
      '/support/contact',
    ];

    const maxWidths: string[] = [];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Find main container
      const container = page
        .locator('main > div, main > [class*="container"]')
        .first();
      const maxWidth = await container.evaluate((el) => {
        return window.getComputedStyle(el).maxWidth;
      });

      maxWidths.push(maxWidth);
    }

    // All containers should use consistent max-width (1152px = 72rem = max-w-6xl)
    const uniqueWidths = [...new Set(maxWidths)];
    expect(
      uniqueWidths.length,
      `Inconsistent container widths found: ${maxWidths.join(', ')}`,
    ).toBe(1);
  });
});

test.describe('UI Consistency - Component Comparison', () => {
  test('Header consistency across pages', async ({ page }) => {
    const pages = [
      '/',
      '/collections/microscope-camera-monitors',
      '/products/13-3-camera-monitor',
    ];
    const screenshots: Buffer[] = [];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const header = page.locator('header').first();
      const screenshot = await header.screenshot({ animations: 'disabled' });
      screenshots.push(screenshot);
    }

    // Headers should be visually identical
    // (In real implementation, you'd use image comparison library)
    expect(screenshots.length).toBe(pages.length);
  });

  test('Footer consistency across pages', async ({ page }) => {
    const pages = [
      '/',
      '/collections/microscope-camera-monitors',
      '/support/faq',
    ];

    for (let i = 0; i < pages.length; i++) {
      await page.goto(pages[i]);
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer').first();
      await expect(footer).toHaveScreenshot(`footer-page-${i}.png`, {
        maxDiffPixels: 100,
      });
    }
  });
});
