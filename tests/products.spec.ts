import { test, expect } from '@playwright/test';

test.describe('Product Page', () => {
  const productUrl = '/products/13-3-camera-monitor';

  test.beforeEach(async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');
  });

  test('should display product title, description, pricing, and stock status', async ({
    page,
  }) => {
    await expect(page.locator('[data-test-id="product-title"]')).toBeVisible();
    await expect(
      page.locator('[data-test-id="product-description"]'),
    ).toBeVisible();
    await expect(page.locator('[data-test-id="product-price"]')).toBeVisible();
    // Assuming stock status is visible as text or a specific element
    await expect(
      page.locator('[data-test-id="product-stock-status"]'),
    ).toBeVisible();
  });

  test('variants should be selectable and update price', async ({ page }) => {
    const variantSelector = page.locator('[data-test-id="variant-selector"]');
    if (await variantSelector.isVisible()) {
      // Check if there are multiple options
      const options = await variantSelector.locator('option').all();
      if (options.length > 1) {
        const initialPrice = await page
          .locator('[data-test-id="product-price"]')
          .textContent();

        // Select the second variant if it exists
        await variantSelector.selectOption({ index: 1 });
        await page.waitForLoadState('networkidle');

        const updatedPrice = await page
          .locator('[data-test-id="product-price"]')
          .textContent();
        expect(updatedPrice).not.toEqual(initialPrice); // Price should change
      } else {
        console.warn(
          'Only one variant available. Skipping variant price test.',
        );
      }
    } else {
      console.warn(
        'Variant selector not found or not visible. Skipping variant test.',
      );
    }
  });

  test('Add to Cart should update cart state and disable button while processing', async ({
    page,
  }) => {
    const addToCartButton = page.locator('[data-test-id="add-to-cart-button"]');
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();

    await addToCartButton.click();

    // Check if button is disabled while processing
    await expect(addToCartButton).toBeDisabled();

    // Wait for cart to update (adjust selector for your cart drawer/icon)
    const cartCount = page.locator('[data-test-id="cart-count"]');
    await expect(cartCount).toHaveText('1'); // Assuming one item is added

    // Ensure button is re-enabled after processing
    await expect(addToCartButton).toBeEnabled();
  });
});
