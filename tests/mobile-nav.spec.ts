import { test, expect } from '@playwright/test';

test.describe('Mobile navigation', () => {
  test('drawer opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const openButton = page.getByRole('button', { name: /open navigation/i });
    await openButton.click();

    const drawer = page.locator('[data-state="open"][role="dialog"], [data-state="open"] nav');
    await expect(drawer).toBeVisible();

    const closeButton = page.getByRole('button', { name: /close navigation/i });
    await closeButton.click();

    await expect(drawer).toBeHidden();
  });
});
