import { test, expect } from '@playwright/test';

test.describe('Collections fallback imagery', () => {
  test('collection card uses fallback when primary image missing', async ({ page, request }) => {
    const res = await request.get('/api/collections');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const collections = data.collections as Array<{
      title: string;
      image?: { url: string } | null;
    }>;

    // Find a collection without a direct image
    const fallbackCollection = collections.find((col) => !col.image);
    test.skip(!fallbackCollection, 'No collection without primary image found');

    await page.goto('/');
    const card = page.locator('article').filter({ hasText: fallbackCollection?.title ?? '' }).first();

    await expect(card).toBeVisible();
    const imgSrc = await card.locator('img').getAttribute('src');
    expect(imgSrc).toBeTruthy();
  });
});
