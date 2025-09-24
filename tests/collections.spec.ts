import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  expectPageAccessible,
  selectors,
} from './utils/helpers';

test.describe('Collections Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collections');
    await waitForPageLoad(page);
  });

  test('should display collections page', async ({ page }) => {
    // Check page loads properly
    await expect(page.locator('h1')).toBeVisible();
    await expectPageAccessible(page);

    // Check page title contains collections
    const title = await page.title();
    expect(
      title.includes('Collections') || title.includes('Lab Essentials'),
    ).toBe(true);
  });

  test('should display collection cards', async ({ page }) => {
    // Wait for collections to load
    await page.waitForSelector('[data-test-id="collection-card"]', {
      timeout: 10000,
    });

    const collectionCards = page.locator('[data-test-id="collection-card"]');
    const cardCount = await collectionCards.count();

    // Should have at least one collection
    expect(cardCount).toBeGreaterThan(0);

    // Check first collection card structure
    if (cardCount > 0) {
      const firstCard = collectionCards.first();
      await expect(firstCard.locator('img')).toBeVisible();
      await expect(firstCard.locator('a')).toHaveAttribute(
        'href',
        /\/collections\//,
      );
    }
  });

  test('should navigate to individual collection', async ({ page }) => {
    // Wait for collections to load
    await page.waitForSelector('[data-test-id="collection-card"]', {
      timeout: 10000,
    });

    const collectionLinks = page.locator('[data-test-id="collection-card"] a');
    const linkCount = await collectionLinks.count();

    if (linkCount > 0) {
      const firstLink = collectionLinks.first();

      await firstLink.click();
      await waitForPageLoad(page);

      // Should navigate to collection page
      expect(page.url()).toContain('/collections/');
      await expectPageAccessible(page);

      // Should display products
      const productsContainer = page.locator(
        '[data-test-id="products-container"]',
      );
      await expect(productsContainer).toBeVisible();
    }
  });
});

test.describe('Individual Collection Page', () => {
  test('should display collection with products', async ({ page }) => {
    // Navigate to a specific collection (adjust handle as needed)
    await page.goto('/collections/microscopes');
    await waitForPageLoad(page);

    // Check collection page elements
    await expect(page.locator('h1')).toBeVisible();
    await expectPageAccessible(page);

    // Check for products container
    const productsContainer = page.locator(
      '[data-test-id="products-container"]',
    );
    await expect(productsContainer).toBeVisible();
  });

  test('should have working collection filters', async ({ page }) => {
    await page.goto('/collections/microscopes');
    await waitForPageLoad(page);

    // Check if filters exist
    const filters = page.locator(selectors.collectionFilter);
    const filterCount = await filters.count();

    if (filterCount > 0) {
      // Test filter interaction
      const firstFilter = filters.first();
      await firstFilter.click();
      await page.waitForTimeout(1000);

      // URL should update with filter parameters
      expect(page.url()).toMatch(/[\?&]/); // Should have query parameters
    }
  });

  test('should handle empty collections gracefully', async ({ page }) => {
    // Try to navigate to a potentially empty collection
    await page.goto('/collections/empty-collection');

    // Should not crash and should show appropriate message
    await expectPageAccessible(page);

    // Check for empty state message or products
    const emptyMessage = page.locator('[data-test-id="empty-collection"]');
    const products = page.locator(selectors.productCard);

    const hasEmptyMessage = await emptyMessage.isVisible();
    const hasProducts = (await products.count()) > 0;

    // Should have either products or empty message
    expect(hasEmptyMessage || hasProducts).toBe(true);
  });
});

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collections/microscopes');
    await waitForPageLoad(page);
  });

  test('should display product cards in collection', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector(selectors.productCard, { timeout: 10000 });

    const productCards = page.locator(selectors.productCard);
    const cardCount = await productCards.count();

    // Should have at least one product
    expect(cardCount).toBeGreaterThan(0);

    // Check product card structure
    if (cardCount > 0) {
      const firstCard = productCards.first();

      // Should have image
      await expect(firstCard.locator('img')).toBeVisible();

      // Should have product link
      const productLink = firstCard.locator('a[href*="/products/"]');
      await expect(productLink).toBeVisible();

      // Should have price information
      const priceElement = firstCard.locator('[data-test-id="product-price"]');
      if ((await priceElement.count()) > 0) {
        await expect(priceElement).toBeVisible();
      }
    }
  });

  test('should navigate to product detail page', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector(selectors.productCard, { timeout: 10000 });

    const productLinks = page.locator(
      `${selectors.productCard} a[href*="/products/"]`,
    );
    const linkCount = await productLinks.count();

    if (linkCount > 0) {
      const firstLink = productLinks.first();
      await firstLink.click();
      await waitForPageLoad(page);

      // Should navigate to product page
      expect(page.url()).toContain('/products/');
      await expectPageAccessible(page);

      // Should have product details
      await expect(page.locator('h1')).toBeVisible();

      // Should have add to cart button
      const addToCartButton = page.locator(selectors.addToCartButton);
      await expect(addToCartButton).toBeVisible();
    }
  });

  test('should handle product image interactions', async ({ page }) => {
    // Navigate to first product
    await page.waitForSelector(selectors.productCard, { timeout: 10000 });
    const firstProductLink = page
      .locator(`${selectors.productCard} a[href*="/products/"]`)
      .first();

    if ((await firstProductLink.count()) > 0) {
      await firstProductLink.click();
      await waitForPageLoad(page);

      // Check for product images
      const productImages = page.locator('[data-test-id="product-image"]');
      const imageCount = await productImages.count();

      if (imageCount > 0) {
        const firstImage = productImages.first();
        await expect(firstImage).toBeVisible();

        // Check if image has proper alt text
        const altText = await firstImage.getAttribute('alt');
        expect(altText).toBeTruthy();
        expect(altText?.length).toBeGreaterThan(0);
      }

      // Test image gallery if multiple images exist
      if (imageCount > 1) {
        const thumbnails = page.locator('[data-test-id="image-thumbnail"]');
        const thumbnailCount = await thumbnails.count();

        if (thumbnailCount > 1) {
          await thumbnails.nth(1).click();
          await page.waitForTimeout(500);
          // Main image should update (this is implementation dependent)
        }
      }
    }
  });

  test('should display product information correctly', async ({ page }) => {
    // Navigate to first product
    await page.waitForSelector(selectors.productCard, { timeout: 10000 });
    const firstProductLink = page
      .locator(`${selectors.productCard} a[href*="/products/"]`)
      .first();

    if ((await firstProductLink.count()) > 0) {
      await firstProductLink.click();
      await waitForPageLoad(page);

      // Check required product information
      await expect(page.locator('h1')).toBeVisible(); // Product title

      // Check for price
      const priceElement = page.locator('[data-test-id="product-price"]');
      if ((await priceElement.count()) > 0) {
        await expect(priceElement).toBeVisible();
        const priceText = await priceElement.textContent();
        expect(priceText).toMatch(/\$|€|£|\d/); // Should contain currency or numbers
      }

      // Check for product description
      const descriptionElement = page.locator(
        '[data-test-id="product-description"]',
      );
      if ((await descriptionElement.count()) > 0) {
        await expect(descriptionElement).toBeVisible();
      }

      // Check for variant selector if product has variants
      const variantSelector = page.locator('[data-test-id="variant-selector"]');
      if ((await variantSelector.count()) > 0) {
        await expect(variantSelector).toBeVisible();
      }
    }
  });

  test('should handle pagination or load more', async ({ page }) => {
    // Check if pagination exists
    const paginationNext = page.locator('[data-test-id="pagination-next"]');
    const loadMoreButton = page.locator(selectors.loadMoreButton);

    const hasPagination = await paginationNext.isVisible();
    const hasLoadMore = await loadMoreButton.isVisible();

    if (hasPagination) {
      const currentUrl = page.url();
      await paginationNext.click();
      await waitForPageLoad(page);

      // URL should change
      expect(page.url()).not.toBe(currentUrl);

      // Should still have products
      await expect(page.locator(selectors.productCard)).toBeVisible();
    } else if (hasLoadMore) {
      const initialProductCount = await page
        .locator(selectors.productCard)
        .count();

      await loadMoreButton.click();
      await page.waitForTimeout(2000);

      const newProductCount = await page.locator(selectors.productCard).count();
      expect(newProductCount).toBeGreaterThan(initialProductCount);
    }
  });

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.locator(selectors.searchInput);

    if (await searchInput.isVisible()) {
      await searchInput.fill('microscope');
      await searchInput.press('Enter');
      await waitForPageLoad(page);

      // Should navigate to search results or filter products
      const products = page.locator(selectors.productCard);
      const productCount = await products.count();

      // Search should return results or show no results message
      const noResultsMessage = page.locator('[data-test-id="no-results"]');
      const hasResults = productCount > 0;
      const hasNoResultsMessage = await noResultsMessage.isVisible();

      expect(hasResults || hasNoResultsMessage).toBe(true);
    }
  });
});
