import { test, expect } from '@playwright/test';

test.describe('Product SEO metadata', () => {
  test('canonical link and JSON-LD present', async ({ page }) => {
    await page.goto('/products/product1');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/products/product1');

    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    expect(jsonLdScripts.length).toBeGreaterThan(0);
    const hasProductSchema = jsonLdScripts.some((content) => content.includes('"@type":"Product"'));
    expect(hasProductSchema).toBeTruthy();
  });
});
