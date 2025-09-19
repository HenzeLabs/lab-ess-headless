// Placeholder for SEO tests
import { test, expect } from '@playwright/test';

test.describe('SEO Tests', () => {
  test('should have a canonical link', async ({ page }) => {
    await page.goto('/');
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute('href', 'http://localhost:3000/');
  });

  test('should have a robots meta tag', async ({ page }) => {
    await page.goto('/');
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', 'index, follow');
  });

  // More SEO tests will be added here
});
