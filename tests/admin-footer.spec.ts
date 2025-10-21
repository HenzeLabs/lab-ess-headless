import { test, expect } from '@playwright/test';

test.describe('Footer presence', () => {
  test('renders footer on /admin', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'http://localhost:3000/admin', {
      waitUntil: 'networkidle',
    });
    // Wait for client hydration to render the footer
    await page.waitForSelector('[data-test-id="footer"]', { timeout: 5000 });
    const count = await page.locator('[data-test-id="footer"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('renders footer on /', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'http://localhost:3000/', {
      waitUntil: 'networkidle',
    });
    await page.waitForSelector('[data-test-id="footer"]', { timeout: 5000 });
    const count = await page.locator('[data-test-id="footer"]').count();
    expect(count).toBeGreaterThan(0);
  });
});
