import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  const staticPages = ['/about', '/contact', '/support']; // Add more static pages as needed

  for (const pagePath of staticPages) {
    test(`should load ${pagePath} without errors`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(pagePath);
      // Basic check for content, assuming a main heading or body content
      await expect(page.locator('h1, main')).toBeVisible();
      // You might want to add more specific checks for each page's content
    });
  }

  test('contact form should accept valid input and show confirmation', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-test-id="contact-name"]').fill('John Doe');
    await page.locator('[data-test-id="contact-email"]').fill(`test-${Date.now()}@example.com`);
    await page.locator('[data-test-id="contact-message"]').fill('This is a test message.');
    await page.locator('[data-test-id="contact-submit-button"]').click();

    // Expect a success message or redirect
    await expect(page.locator('[data-test-id="contact-success-message"]')).toBeVisible();
    await expect(page.locator('[data-test-id="contact-success-message"]')).toContainText('Thank you');
  });

  test('newsletter signup should accept valid input and show confirmation', async ({ page }) => {
    // Assuming newsletter signup is on the homepage or footer
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-test-id="newsletter-email-input"]').fill(`newsletter-${Date.now()}@example.com`);
    await page.locator('[data-test-id="newsletter-submit-button"]').click();

    // Expect a success message
    await expect(page.locator('[data-test-id="newsletter-success-message"]')).toBeVisible();
    await expect(page.locator('[data-test-id="newsletter-success-message"]')).toContainText('Thank you for subscribing');
  });
});
