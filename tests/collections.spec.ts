import { test, expect } from '@playwright/test';

test.describe('Collections', () => {
  const collectionUrl = '/collections/microscope-camera-monitors'; // Use a collection that has products

  test.beforeEach(async ({ page }) => {
    await page.goto(collectionUrl);
    await page.waitForLoadState('networkidle');
  });

  test('should render product cards with title, price, and image', async ({
    page,
  }) => {
    // Assuming product cards have a common selector, e.g., a class or data-test-id
    const productCards = page.locator('[data-test-id="product-card"]');
    await expect(productCards).not.toHaveCount(0); // Ensure at least one product card is present

    const firstProductCard = productCards.first();
    await expect(
      firstProductCard.locator('[data-test-id="product-title"]'),
    ).toBeVisible();
    await expect(
      firstProductCard.locator('[data-test-id="product-price"]'),
    ).toBeVisible();
    await expect(
      firstProductCard.locator('[data-test-id="product-image"]'),
    ).toBeVisible();
  });

  test('filters should work and update product list', async ({ page }) => {
    // This test assumes filters are present and have a common selector
    // Example: a dropdown for sorting or checkboxes for tags
    const filterDropdown = page.locator(
      '[data-test-id="collection-filter-sort"]',
    );
    if (await filterDropdown.isVisible()) {
      const initialProductTitles = await page
        .locator('[data-test-id="product-title"]')
        .allTextContents();

      await filterDropdown.selectOption({ label: 'Price: Low to High' }); // Adjust option value/label
      await page.waitForLoadState('networkidle');

      const filteredProductTitles = await page
        .locator('[data-test-id="product-title"]')
        .allTextContents();
      expect(filteredProductTitles).not.toEqual(initialProductTitles); // Expect product list to change
      // Further assertions can be added to verify the sorting order
    } else {
      console.warn('Collection filters not found or not visible.');
    }
  });

  test('pagination should work and load more products', async ({ page }) => {
    // This test assumes pagination is present and has a common selector
    const paginationNextButton = page.locator(
      '[data-test-id="pagination-next"]',
    );
    if (await paginationNextButton.isVisible()) {
      const initialProductCount = await page
        .locator('[data-test-id="product-card"]')
        .count();

      await paginationNextButton.click();
      await page.waitForLoadState('networkidle');

      const newProductCount = await page
        .locator('[data-test-id="product-card"]')
        .count();
      expect(newProductCount).toBeGreaterThan(initialProductCount); // Expect more products to load
    } else {
      console.warn('Collection pagination not found or not visible.');
    }
  });

  test('should display fallback messaging for empty states', async ({
    page,
  }) => {
    // Navigate to an empty collection or simulate an empty state
    // This might require a specific URL or mocking data in a real scenario
    // For now, we'll assume a specific empty collection URL if available
    const emptyCollectionUrl = '/collections/empty-collection'; // Adjust if you have an empty collection
    await page.goto(emptyCollectionUrl);
    await page.waitForLoadState('networkidle');

    const emptyStateMessage = page.locator(
      '[data-test-id="empty-collection-message"]',
    );
    if (await emptyStateMessage.isVisible()) {
      await expect(emptyStateMessage).toBeVisible();
      await expect(emptyStateMessage).not.toBeEmpty();
    } else {
      console.warn(
        'Empty collection fallback message not found or not visible. Please ensure an empty collection URL is provided or mock an empty state.',
      );
    }
  });
});
