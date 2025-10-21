import { test, expect } from '@playwright/test';

test.describe('Navigation accessibility', () => {
  test.skip('desktop mega menu opens and closes via keyboard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const menuTrigger = page.locator('button[aria-haspopup="true"]').first();

    await menuTrigger.focus();
    await expect(menuTrigger).toBeFocused();

    await page.keyboard.press('Enter');
    const megaMenu = page.locator('[role="menu"]').first();
    await expect(megaMenu).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(megaMenu.locator('a').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(megaMenu).toBeHidden();
    await expect(menuTrigger).toBeFocused();
  });
});
