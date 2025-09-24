import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  addProductToCart,
  selectors,
  clearCart,
  checkProductAvailability,
  getCartItemCount,
  dismissCookieConsent,
} from './utils/helpers';
import { getTestProductHandle } from './utils/test-products';

test.describe('Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await clearCart(page);
    // Check if we have working test products
    const hasProducts = await checkProductAvailability(page);
    if (!hasProducts) {
      console.warn(
        'Test products not available. Some cart tests may be skipped.',
      );
    }
  });

  test('should start with empty cart', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const cartCount = await getCartItemCount(page);
    expect(cartCount).toBe(0);

    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Should show empty cart message
    const emptyCartMessage = page.locator('[data-test-id="empty-cart"]');
    await expect(emptyCartMessage).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Check if test products are available first
    const testProductHandle = getTestProductHandle('default');
    const hasProduct = await checkProductAvailability(page, testProductHandle);

    if (!hasProduct) {
      test.skip(true, 'Test product not available in Shopify store');
    }

    // Add a product to cart
    await addProductToCart(page, testProductHandle);

    // Cart count should increase
    const cartCount = await getCartItemCount(page);
    expect(cartCount).toBeGreaterThan(0);

    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);
    await dismissCookieConsent(page);

    // Should show cart items
    const cartItems = page.locator('[data-test-id="cart-item"]');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // First item should have product details
    const firstItem = cartItems.first();
    await expect(firstItem.locator('img')).toBeVisible();
    await expect(
      firstItem.locator('[data-test-id="cart-item-name"]'),
    ).toBeVisible();
    await expect(
      firstItem.locator('[data-test-id="cart-item-price"]'),
    ).toBeVisible();
  });

  test('should update item quantities', async ({ page }) => {
    // Check if test products are available first
    const testProductHandle = getTestProductHandle('default');
    const hasProduct = await checkProductAvailability(page, testProductHandle);

    if (!hasProduct) {
      test.skip(true, 'Test product not available in Shopify store');
    }

    // Add a product to cart
    await addProductToCart(page, testProductHandle);

    // Go to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);
    await dismissCookieConsent(page);

    // Find cart item and current quantity
    const cartItem = page.locator('[data-test-id="cart-item"]').first();
    const quantityDisplay = cartItem.locator(
      '[data-test-id="cart-item-quantity"]',
    );
    const initialQuantity = await quantityDisplay.textContent();

    // Increase quantity using + button
    const increaseButton = cartItem.locator('button:has-text("+")');
    await increaseButton.click();
    await page.waitForTimeout(2000); // Wait for cart update

    // Verify quantity was updated
    const updatedQuantity = await quantityDisplay.textContent();
    expect(parseInt(updatedQuantity || '0')).toBeGreaterThan(
      parseInt(initialQuantity || '0'),
    );
  });

  test('should allow removing items from cart', async ({ page }) => {
    // Check if test products are available first
    const testProductHandle = getTestProductHandle('default');
    const hasProduct = await checkProductAvailability(page, testProductHandle);

    if (!hasProduct) {
      test.skip(true, 'Test product not available in Shopify store');
    }

    // Add a product to cart first
    await addProductToCart(page, testProductHandle);

    // Go to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);
    await dismissCookieConsent(page);

    // Check initial item count
    const initialItems = page.locator('[data-test-id="cart-item"]');
    const initialCount = await initialItems.count();
    expect(initialCount).toBeGreaterThan(0);

    // Remove first item
    const removeButton = page.locator('button:has-text("Remove")').first();
    await removeButton.click();

    // Wait for cart to update
    await page.waitForTimeout(1000);

    // Check that item count decreased
    const updatedItems = page.locator('[data-test-id="cart-item"]');
    const updatedCount = await updatedItems.count();
    expect(updatedCount).toBeLessThan(initialCount);
  });

  test('should display cart totals correctly', async ({ page }) => {
    // Add products to cart
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);

    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Check for subtotal
    const subtotal = page.locator('[data-test-id="cart-subtotal"]');
    if ((await subtotal.count()) > 0) {
      await expect(subtotal).toBeVisible();

      const subtotalText = await subtotal.textContent();
      expect(subtotalText).toMatch(/\$|€|£|\d/);
    }

    // Check for total
    const total = page.locator('[data-test-id="cart-total"]');
    if ((await total.count()) > 0) {
      await expect(total).toBeVisible();

      const totalText = await total.textContent();
      expect(totalText).toMatch(/\$|€|£|\d/);
    }

    // Check for tax information if displayed
    const tax = page.locator('[data-test-id="cart-tax"]');
    if ((await tax.count()) > 0) {
      await expect(tax).toBeVisible();
    }

    // Check for shipping information if displayed
    const shipping = page.locator('[data-test-id="cart-shipping"]');
    if ((await shipping.count()) > 0) {
      await expect(shipping).toBeVisible();
    }
  });

  test('should handle cart persistence across sessions', async ({
    page,
    context,
  }) => {
    // Add product to cart
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);

    const initialCartCount = await getCartItemCount(page);
    expect(initialCartCount).toBeGreaterThan(0);

    // Create new page in same context (simulates page refresh)
    const newPage = await context.newPage();
    await newPage.goto('/');
    await waitForPageLoad(newPage);

    // Cart should persist
    const persistedCartCount = await getCartItemCount(newPage);
    expect(persistedCartCount).toBe(initialCartCount);

    await newPage.close();
  });

  test('should update cart count in header', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Initial cart count should be 0
    let cartCount = await getCartItemCount(page);
    expect(cartCount).toBe(0);

    // Add product to cart
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);

    // Cart count should update
    cartCount = await getCartItemCount(page);
    expect(cartCount).toBeGreaterThan(0);

    // Add another product
    await addProductToCart(page, testProductHandle);

    // Cart count should increase further
    const newCartCount = await getCartItemCount(page);
    expect(newCartCount).toBeGreaterThan(cartCount);
  });

  test('should handle cart drawer functionality', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Add product to cart to test drawer functionality
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);

    // Check if cart drawer opens
    const cartDrawer = page.locator('[data-test-id="cart-drawer"]');

    if ((await cartDrawer.count()) > 0) {
      // Cart drawer should be visible after adding product
      await expect(cartDrawer).toBeVisible();

      // Should show added product
      const drawerItems = cartDrawer.locator('[data-test-id="cart-item"]');
      await expect(drawerItems.first()).toBeVisible();

      // Close button should work
      const closeButton = cartDrawer.locator(
        '[data-test-id="close-cart-drawer"]',
      );
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
        await page.waitForTimeout(500);
        await expect(cartDrawer).not.toBeVisible();
      }
    }
  });

  test('should handle multiple product variants in cart', async ({ page }) => {
    // This test assumes products have variants
    const productHandle = getTestProductHandle('withVariations');
    await page.goto(`/products/${productHandle}`);
    await waitForPageLoad(page);

    // Check if product has variants
    const variantSelector = page.locator('[data-test-id="variant-selector"]');

    if ((await variantSelector.count()) > 0) {
      // Select first variant and add to cart
      const firstVariant = variantSelector.first();
      const selectElement = firstVariant.locator('select');

      if ((await selectElement.count()) > 0) {
        await selectElement.selectOption({ index: 0 });
        await page.click(selectors.addToCartButton);
        await page.waitForTimeout(1000);

        // Select different variant and add to cart
        await selectElement.selectOption({ index: 1 });
        await page.click(selectors.addToCartButton);
        await page.waitForTimeout(1000);

        // Go to cart and check for multiple items
        await page.goto('/cart');
        await waitForPageLoad(page);

        const cartItems = page.locator('[data-test-id="cart-item"]');
        const itemCount = await cartItems.count();
        expect(itemCount).toBe(2);
      }
    }
  });

  test('should show loading states during cart updates', async ({ page }) => {
    // Add product to cart
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);

    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Test loading state during quantity update
    const quantityInput = page
      .locator('[data-test-id="quantity-input"]')
      .first();
    const updateButton = page.locator(selectors.updateQuantityButton).first();

    if ((await quantityInput.count()) > 0) {
      await quantityInput.fill('5');

      if ((await updateButton.count()) > 0) {
        await updateButton.click();

        // Check for loading indicator
        const loadingIndicator = page.locator('[data-test-id="cart-loading"]');
        if ((await loadingIndicator.count()) > 0) {
          await expect(loadingIndicator).toBeVisible();

          // Loading should disappear after update
          await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('should handle cart errors gracefully', async ({ page }) => {
    // Add product to cart
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);

    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Try to set invalid quantity (very high number)
    const quantityInput = page
      .locator('[data-test-id="quantity-input"]')
      .first();

    if ((await quantityInput.count()) > 0) {
      await quantityInput.fill('99999');
      await quantityInput.press('Enter');
      await page.waitForTimeout(2000);

      // Should either show error message or revert to valid quantity
      const errorMessage = page.locator('[data-test-id="cart-error"]');
      const hasError = await errorMessage.isVisible();

      if (!hasError) {
        // Quantity should revert to valid amount
        const finalQuantity = await quantityInput.inputValue();
        expect(parseInt(finalQuantity, 10)).toBeLessThan(99999);
      }
    }
  });
});

test.describe('Cart Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page);
    const testProductHandle = getTestProductHandle('default');
    await addProductToCart(page, testProductHandle);
    await page.goto('/cart');
    await waitForPageLoad(page);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through cart controls
    await page.keyboard.press('Tab');

    let tabCount = 0;
    const maxTabs = 20;

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      const focusedElement = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl
          ? {
              tagName: activeEl.tagName,
              type: activeEl.getAttribute('type'),
              testId: activeEl.getAttribute('data-test-id'),
              role: activeEl.getAttribute('role'),
            }
          : null;
      });

      // Should be able to focus on interactive elements
      if (focusedElement?.testId === 'quantity-input') {
        // Should be able to modify quantity with keyboard
        await page.keyboard.press('ArrowUp');
        break;
      }

      if (focusedElement?.testId === 'remove-item') {
        // Should be able to remove item with Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        break;
      }
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check quantity controls have proper labels
    const quantityInput = page
      .locator('[data-test-id="quantity-input"]')
      .first();

    if ((await quantityInput.count()) > 0) {
      const ariaLabel = await quantityInput.getAttribute('aria-label');
      const hasLabel = ariaLabel && ariaLabel.length > 0;

      const labelElement = page.locator('label');
      const hasLabelElement = (await labelElement.count()) > 0;

      expect(hasLabel || hasLabelElement).toBe(true);
    }

    // Check remove buttons have proper labeling
    const removeButton = page.locator(selectors.removeItemButton).first();

    if ((await removeButton.count()) > 0) {
      const ariaLabel = await removeButton.getAttribute('aria-label');
      const buttonText = await removeButton.textContent();

      const hasProperLabel =
        (ariaLabel && ariaLabel.length > 0) ||
        (buttonText && buttonText.length > 0);
      expect(hasProperLabel).toBe(true);
    }
  });

  test('should announce cart changes to screen readers', async ({ page }) => {
    // Check for live regions - use first() to avoid strict mode violation
    const liveRegion = page.locator('[aria-live]').first();

    if ((await page.locator('[aria-live]').count()) > 0) {
      await expect(liveRegion).toBeVisible();

      const ariaLive = await liveRegion.getAttribute('aria-live');
      expect(['polite', 'assertive']).toContain(ariaLive);
    }
  });
});
