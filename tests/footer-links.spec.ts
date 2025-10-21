import { test, expect } from '@playwright/test';

test.describe('Footer Support Links', () => {
  test('should have correct support page links in footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that footer support links point to correct URLs
    const shippingLink = page.locator('footer a:has-text("Shipping Info")');
    await expect(shippingLink).toHaveAttribute('href', '/support/shipping');

    const returnsLink = page.locator(
      'footer a:has-text("Returns & Exchanges")',
    );
    await expect(returnsLink).toHaveAttribute('href', '/support/returns');

    const faqLink = page.locator('footer a:has-text("FAQs")');
    await expect(faqLink).toHaveAttribute('href', '/support/faq');
  });

  test('should navigate to support pages without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('footer');

    // Test Shipping Info link
    const shippingLink = page.locator('footer a:has-text("Shipping Info")');
    await expect(shippingLink).toBeVisible();
    await shippingLink.click();
    await page.waitForURL('**/support/shipping', { timeout: 10000 });
    expect(page.url()).toContain('/support/shipping');

    // Go back to home
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('footer');

    // Test Returns link
    const returnsLink = page.locator(
      'footer a:has-text("Returns & Exchanges")',
    );
    await expect(returnsLink).toBeVisible();
    await returnsLink.click();
    await page.waitForURL('**/support/returns', { timeout: 10000 });
    expect(page.url()).toContain('/support/returns');

    // Go back to home
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('footer');

    // Test FAQ link
    const faqLink = page.locator('footer a:has-text("FAQs")');
    await expect(faqLink).toBeVisible();
    await faqLink.click();
    await page.waitForURL('**/support/faq', { timeout: 10000 });
    expect(page.url()).toContain('/support/faq');
  });

  test('support pages should load successfully with 200 status', async ({
    page,
  }) => {
    // Test each support page directly
    const supportPages = [
      { path: '/support/shipping', expectedText: 'Shipping Information' },
      { path: '/support/returns', expectedText: 'Return Policy' },
      { path: '/support/faq', expectedText: 'Frequently Asked Questions' },
    ];

    for (const { path, expectedText } of supportPages) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Verify page loaded successfully by checking for expected content
      const mainContent = await page.locator('main').textContent();
      expect(mainContent).toContain(expectedText);
    }
  });
});
