import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  expectPageAccessible,
  selectors,
} from './utils/helpers';
import { getTestProductHandle } from './utils/test-products';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page using test product configuration
    const productHandle = getTestProductHandle('default');
    await page.goto(`/products/${productHandle}`);
    await waitForPageLoad(page);
  });

  test('should display product details', async ({ page }) => {
    // Check basic page structure
    await expectPageAccessible(page);

    // Should have product title
    await expect(page.locator('h1')).toBeVisible();

    // Should have add to cart button
    await expect(page.locator(selectors.addToCartButton)).toBeVisible();

    // Check page title includes product name
    const title = await page.title();
    expect(title).toContain('Lab Essentials');
  });

  test('should display product images', async ({ page }) => {
    // Check for main product image
    const productImages = page.locator('[data-test-id="product-image"]');
    const imageCount = await productImages.count();

    if (imageCount > 0) {
      const mainImage = productImages.first();
      await expect(mainImage).toBeVisible();

      // Check image has alt text
      const altText = await mainImage.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);

      // Check image loads properly (not broken)
      const naturalWidth = await mainImage.evaluate(
        (img: HTMLImageElement) => img.naturalWidth,
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should display price information', async ({ page }) => {
    // Check for price element
    const priceElement = page.locator('[data-test-id="product-price"]');

    if ((await priceElement.count()) > 0) {
      await expect(priceElement).toBeVisible();

      const priceText = await priceElement.textContent();
      expect(priceText).toBeTruthy();

      // Should contain currency symbol or numbers
      expect(priceText).toMatch(/\$|€|£|\d/);
    }
  });

  test('should handle variant selection', async ({ page }) => {
    // Check if product has variants
    const variantSelector = page.locator('[data-test-id="variant-selector"]');
    const variantCount = await variantSelector.count();

    if (variantCount > 0) {
      // Test variant selection
      const firstVariant = variantSelector.first();
      await expect(firstVariant).toBeVisible();

      // If it's a select dropdown
      const selectElement = firstVariant.locator('select');
      if ((await selectElement.count()) > 0) {
        const options = selectElement.locator('option');
        const optionCount = await options.count();

        if (optionCount > 1) {
          await selectElement.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          // Price might update with variant selection
          const priceElement = page.locator('[data-test-id="product-price"]');
          if ((await priceElement.count()) > 0) {
            await expect(priceElement).toBeVisible();
          }
        }
      }

      // If it's radio buttons or other variant selectors
      const variantButtons = firstVariant.locator(
        'button, input[type="radio"]',
      );
      const buttonCount = await variantButtons.count();

      if (buttonCount > 1) {
        await variantButtons.nth(1).click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle quantity selection', async ({ page }) => {
    // Check for quantity input
    const quantityInput = page.locator('[data-test-id="quantity-input"]');

    if ((await quantityInput.count()) > 0) {
      await expect(quantityInput).toBeVisible();

      // Test quantity change
      await quantityInput.fill('2');

      const value = await quantityInput.inputValue();
      expect(value).toBe('2');
    } else {
      // Check for quantity increase/decrease buttons
      const quantityIncrease = page.locator(
        '[data-test-id="quantity-increase"]',
      );

      if ((await quantityIncrease.count()) > 0) {
        await quantityIncrease.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should add product to cart successfully', async ({ page }) => {
    // Get initial cart count
    const initialCartCount = await page
      .locator(selectors.cartCount)
      .textContent();
    const initialCount = parseInt(initialCartCount || '0', 10);

    // Add product to cart
    await page.click(selectors.addToCartButton);

    // Wait for cart update
    await page.waitForTimeout(2000);

    // Check cart count increased
    const newCartCount = await page.locator(selectors.cartCount).textContent();
    const newCount = parseInt(newCartCount || '0', 10);

    expect(newCount).toBeGreaterThan(initialCount);

    // Should show success message or cart drawer
    const successMessage = page.locator('[data-test-id="cart-feedback"]');
    const cartDrawer = page.locator('[data-test-id="cart-drawer"]');

    const hasSuccessMessage = await successMessage.isVisible();
    const hasCartDrawer = await cartDrawer.isVisible();

    expect(hasSuccessMessage || hasCartDrawer).toBe(true);
  });

  test('should display product description', async ({ page }) => {
    const descriptionElement = page.locator(
      '[data-test-id="product-description"]',
    );

    if ((await descriptionElement.count()) > 0) {
      await expect(descriptionElement).toBeVisible();

      const description = await descriptionElement.textContent();
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(0);
    }
  });

  test('should show product specifications if available', async ({ page }) => {
    const specificationsElement = page.locator(
      '[data-test-id="product-specifications"]',
    );

    if ((await specificationsElement.count()) > 0) {
      await expect(specificationsElement).toBeVisible();

      // Should have specification items
      const specItems = specificationsElement.locator(
        '[data-test-id="spec-item"]',
      );
      const itemCount = await specItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('should display related products', async ({ page }) => {
    const relatedProductsSection = page.locator(
      '[data-test-id="related-products"]',
    );

    if ((await relatedProductsSection.count()) > 0) {
      await expect(relatedProductsSection).toBeVisible();

      // Should have related product cards
      const relatedProducts = relatedProductsSection.locator(
        selectors.productCard,
      );
      const relatedCount = await relatedProducts.count();

      if (relatedCount > 0) {
        // Check first related product
        const firstRelated = relatedProducts.first();
        await expect(firstRelated.locator('img')).toBeVisible();
        await expect(firstRelated.locator('a')).toHaveAttribute(
          'href',
          /\/products\//,
        );
      }
    }
  });

  test('should handle out of stock products gracefully', async ({ page }) => {
    // Check if product is out of stock
    const outOfStockMessage = page.locator('[data-test-id="out-of-stock"]');
    const addToCartButton = page.locator(selectors.addToCartButton);

    const isOutOfStock = await outOfStockMessage.isVisible();

    if (isOutOfStock) {
      // Add to cart button should be disabled
      const isDisabled = await addToCartButton.isDisabled();
      expect(isDisabled).toBe(true);

      // Should show out of stock message
      await expect(outOfStockMessage).toBeVisible();
    } else {
      // Add to cart button should be enabled
      await expect(addToCartButton).toBeEnabled();
    }
  });

  test('should have proper breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[data-test-id="breadcrumb"]');

    if ((await breadcrumb.count()) > 0) {
      await expect(breadcrumb).toBeVisible();

      // Should have home link
      const homeLink = breadcrumb.locator('a[href="/"]');
      if ((await homeLink.count()) > 0) {
        await expect(homeLink).toBeVisible();
      }

      // Should have collections link
      const collectionsLink = breadcrumb.locator('a[href*="/collections"]');
      if ((await collectionsLink.count()) > 0) {
        await expect(collectionsLink).toBeVisible();
      }
    }
  });

  test('should have proper product schema markup', async ({ page }) => {
    // Check for JSON-LD product schema
    const productSchema = page.locator('script[type="application/ld+json"]');
    const schemaCount = await productSchema.count();

    if (schemaCount > 0) {
      const schemaContent = await productSchema.first().textContent();
      expect(schemaContent).toBeTruthy();

      // Should contain Product schema
      const hasProductSchema =
        schemaContent?.includes('"@type":"Product"') ||
        schemaContent?.includes('"@type": "Product"');
      expect(hasProductSchema).toBe(true);
    }
  });
});

test.describe('Product Page Performance', () => {
  test('should load product page quickly', async ({ page }) => {
    const startTime = Date.now();

    const productHandle = getTestProductHandle('default');
    await page.goto(`/products/${productHandle}`);
    await waitForPageLoad(page);

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle product image loading efficiently', async ({ page }) => {
    const productHandle = getTestProductHandle('default');
    await page.goto(`/products/${productHandle}`);

    // Check that images have proper loading attributes
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const image = images.nth(i);
      const loading = await image.getAttribute('loading');

      // First image should not be lazy loaded, others can be
      if (i === 0) {
        expect(loading).not.toBe('lazy');
      }
    }
  });
});

test.describe('Product Page Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    const productHandle = getTestProductHandle('default');
    await page.goto(`/products/${productHandle}`);
    await waitForPageLoad(page);

    // Tab through the page
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing to add to cart button
    let attempts = 0;
    while (attempts < 20) {
      await page.keyboard.press('Tab');
      attempts++;

      const currentFocus = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-test-id'),
      );
      if (currentFocus === 'add-to-cart-button') {
        break;
      }
    }

    // Should be able to activate add to cart with Enter
    const addToCartButton = page.locator(selectors.addToCartButton);
    if (
      (await addToCartButton.isVisible()) &&
      (await addToCartButton.isEnabled())
    ) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Cart should update
      const cartCount = page.locator(selectors.cartCount);
      await expect(cartCount).toBeVisible();
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    const productHandle = getTestProductHandle('default');
    await page.goto(`/products/${productHandle}`);
    await waitForPageLoad(page);

    // Check add to cart button has proper labeling
    const addToCartButton = page.locator(selectors.addToCartButton);
    if ((await addToCartButton.count()) > 0) {
      const ariaLabel = await addToCartButton.getAttribute('aria-label');
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0;

      const buttonText = await addToCartButton.textContent();
      const hasButtonText = buttonText && buttonText.length > 0;

      // Should have either aria-label or button text
      expect(hasAriaLabel || hasButtonText).toBe(true);
    }

    // Check images have alt text
    const productImages = page.locator('[data-test-id="product-image"]');
    const imageCount = await productImages.count();

    for (let i = 0; i < imageCount; i++) {
      const image = productImages.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
    }
  });
});
