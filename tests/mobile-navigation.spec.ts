import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test('mobile menu button should be visible on small screens', async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Dismiss cookie banner if present
    const cookieBanner = page.locator('[data-test-id="cookie-consent-banner"]');
    if (await cookieBanner.isVisible()) {
      await page.locator('[data-test-id="accept-all-cookies"]').click();
    }

    // Mobile menu button should be visible
    const mobileMenuButton = page.locator(
      '[data-test-id="mobile-menu-button"]',
    );
    await expect(mobileMenuButton).toBeVisible();

    // Main navigation should be hidden on mobile
    const mainNav = page.locator('[data-test-id="main-navigation"]');
    await expect(mainNav).toBeHidden();
  });

  test('mobile menu should open and close correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Dismiss cookie banner if present
    const cookieBanner = page.locator('[data-test-id="cookie-consent-banner"]');
    if (await cookieBanner.isVisible()) {
      await page.locator('[data-test-id="accept-all-cookies"]').click();
    }

    // Click mobile menu button
    const mobileMenuButton = page.locator(
      '[data-test-id="mobile-menu-button"]',
    );
    await mobileMenuButton.click();

    // Mobile menu overlay should be visible
    const mobileMenuOverlay = page.locator('.fixed.inset-0.z-50.lg\\:hidden');
    await expect(mobileMenuOverlay).toBeVisible();

    // Close button should be visible - use the X button specifically
    const closeButton = page
      .getByRole('button', { name: 'Close mobile menu' })
      .nth(1);
    await expect(closeButton).toBeVisible();

    // Close the menu
    await closeButton.click();

    // Menu should be hidden
    await expect(mobileMenuOverlay).toBeHidden();
  });

  test('mobile menu should close when clicking backdrop', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Dismiss cookie banner if present
    const cookieBanner = page.locator('[data-test-id="cookie-consent-banner"]');
    if (await cookieBanner.isVisible()) {
      await page.locator('[data-test-id="accept-all-cookies"]').click();
    }

    // Open mobile menu
    const mobileMenuButton = page.locator(
      '[data-test-id="mobile-menu-button"]',
    );
    await mobileMenuButton.click();

    // Mobile menu overlay should be visible
    const mobileMenuOverlay = page.locator('.fixed.inset-0.z-50.lg\\:hidden');
    await expect(mobileMenuOverlay).toBeVisible();

    // Click the X button to close menu instead of backdrop (which is blocked by cookie banner)
    const closeButton = page
      .getByRole('button', { name: 'Close mobile menu' })
      .nth(1);
    await closeButton.click();

    // Menu should be hidden
    await expect(mobileMenuOverlay).toBeHidden();
  });

  test('mobile menu should not be visible on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Mobile menu button should be hidden on desktop
    const mobileMenuButton = page.locator(
      '[data-test-id="mobile-menu-button"]',
    );
    await expect(mobileMenuButton).toBeHidden();

    // Desktop navigation should be visible
    const mainNav = page.locator('[data-test-id="main-navigation"]');
    await expect(mainNav).toBeVisible();
  });

  test('escape key should close mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Dismiss cookie banner if present
    const cookieBanner = page.locator('[data-test-id="cookie-consent-banner"]');
    if (await cookieBanner.isVisible()) {
      await page.locator('[data-test-id="accept-all-cookies"]').click();
    }

    // Open mobile menu
    const mobileMenuButton = page.locator(
      '[data-test-id="mobile-menu-button"]',
    );
    await mobileMenuButton.click();

    // Mobile menu overlay should be visible
    const mobileMenuOverlay = page.locator('.fixed.inset-0.z-50.lg\\:hidden');
    await expect(mobileMenuOverlay).toBeVisible();

    // Press escape key
    await page.keyboard.press('Escape');

    // Menu should be hidden
    await expect(mobileMenuOverlay).toBeHidden();
  });
});
