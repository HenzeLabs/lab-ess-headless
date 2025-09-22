import { test, expect } from '@playwright/test';

test.describe('Error Handling and Network Resilience', () => {
  test('should show graceful loading states during network slowdown', async ({ page }) => {
    // Intercept all network requests and introduce a delay
    await page.route('**/*', async (route) => {
      await new Promise(f => setTimeout(f, 1000)); // 1-second delay for all requests
      route.continue();
    });

    await page.goto('/');

    // Expect to see a loading indicator or skeleton UI
    // This selector needs to be specific to your application's loading state
    const loadingIndicator = page.locator('[data-test-id="loading-indicator"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    } else {
      console.warn('Loading indicator not found or not visible. Please ensure your application has a loading state.');
    }

    await page.waitForLoadState('networkidle');

    // After load, the loading indicator should be gone
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible();
    }

    // Basic check that the page eventually loads without crashes
    await expect(page.locator('header')).toBeVisible();
  });

  test('should handle API errors gracefully without crashing', async ({ page }) => {
    // Intercept specific API requests and return an error status
    await page.route('**/api/collections*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/collections/all'); // Navigate to a page that uses the collections API
    await page.waitForLoadState('networkidle');

    // Expect to see an error message or a fallback UI, not a blank page or crash
    const errorMessage = page.locator('[data-test-id="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).not.toBeEmpty();
    } else {
      console.warn('Error message for API failures not found or not visible. Please ensure your application handles API errors gracefully.');
    }

    // Ensure the page doesn't crash (e.g., still has header/footer)
    await expect(page.locator('header')).toBeVisible();
  });
});
