import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have a visible header, navigation, hero, and footer', async ({ page }) => {
    await expect(page.locator('header[data-test-id="header"]')).toBeVisible();
    await expect(page.locator('nav[data-test-id="main-navigation"]')).toBeVisible();
    await expect(page.locator('section[data-test-id="hero-section"]')).toBeVisible();
    await expect(page.locator('footer[data-test-id="footer"]')).toBeVisible();
  });

  test('should display the announcement bar if present', async ({ page }) => {
    const announcementBar = page.locator('[data-test-id="announcement-bar"]');
    await expect(announcementBar).toBeVisible();
    await expect(announcementBar).not.toBeEmpty();
  });

  test('all primary CTAs should link to valid pages', async ({ page }) => {
    // Assuming primary CTAs have a common data-test-id or a specific class
    const ctaSelectors = [
      'a[data-test-id="hero-cta"]',
      'a[data-test-id="featured-collection-cta"]',
      'a[data-test-id="featured-product-cta"]',
    ];

    for (const selector of ctaSelectors) {
      const cta = page.locator(selector).first();
      await expect(cta).toBeVisible();
      const href = await cta.getAttribute('href');
      expect(href).toBeTruthy();

      const [newPage] = await Promise.all([
        page.waitForEvent('load'),
        cta.click(),
      ]);
      await newPage.waitForLoadState('networkidle');
      expect(newPage.url()).not.toContain('404');
      expect(newPage.url()).not.toContain('error');
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
  });

  test.describe('Responsive checks', () => {
    test('should render correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('header[data-test-id="header"]')).toBeVisible();
      await expect(page).toHaveScreenshot('homepage-desktop.png', { fullPage: true });
    });

    test('should render correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('header[data-test-id="header"]')).toBeVisible();
      await expect(page).toHaveScreenshot('homepage-tablet.png', { fullPage: true });
    });

    test('should render correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('header[data-test-id="header"]')).toBeVisible();
      await expect(page).toHaveScreenshot('homepage-mobile.png', { fullPage: true });
    });
  });
});
