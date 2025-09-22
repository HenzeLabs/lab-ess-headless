import { test, expect } from '@playwright/test';

// Minimal, reliable smoke covering core Shopify flows
// Assumes dev server runs at baseURL from playwright.config.ts

const timeout = 30_000;

// Helper to assert no 404 in current page
async function expectNo404(page: import('@playwright/test').Page) {
  const status = await page.evaluate(() => document.title);
  expect(status).not.toContain('404');
}

test('Shopify core flows smoke', async ({ page, context }) => {
  test.setTimeout(60_000);
  // 1. Homepage loads without errors
  await page.goto('/', { timeout });
  await expect(page).toHaveTitle(/Lab Essentials/i);
  await expectNo404(page);

  // 2. Products visible on homepage or collections
  // Attempt to find product tiles/links; fall back to collections page
  const productLink = page.locator('a[href^="/products/"]').first();
  if (!(await productLink.count())) {
    await page.goto('/collections', { timeout });
    await expectNo404(page);
  }

  // Find a product link after potential navigation
  const anyProduct = page.locator('a[href^="/products/"]').first();
  await expect(anyProduct).toBeVisible({ timeout });

  // 3. Open product and add to cart
  await anyProduct.click({ timeout });
  await expect(page).toHaveURL(/\/products\//, { timeout });
  await expectNo404(page);

  const addToCart = page.getByRole('button', { name: /add to cart/i });
  await expect(addToCart).toBeVisible({ timeout });
  await addToCart.click();

  // Give server action/API a moment to persist cookie
  await page.waitForTimeout(1000);

  // 4. Cart page renders with items and totals
  await page.goto('/cart', { timeout });
  await expectNo404(page);
  // Look for an order summary and a checkout button
  await expect(
    page.getByRole('heading', { name: /order summary/i }),
  ).toBeVisible({ timeout });
  await expect(page.getByRole('link', { name: /checkout/i })).toBeVisible({
    timeout,
  });

  // Quantity controls should exist; try a minimal increment
  const plus = page.getByRole('button', { name: /increase quantity/i }).first();
  if (await plus.isVisible()) {
    await plus.click();
    await page.waitForTimeout(800);
  }

  // 5. Checkout link should redirect to Shopify checkout
  const checkout = page.getByRole('link', { name: /checkout/i });
  const href = await checkout.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href!).toMatch(/\/cart\/c\//);

  // Verify link is not dead (HEAD < 400)
  const headRes = await context.request.fetch(href!, { method: 'HEAD' });
  expect(headRes.status()).toBeLessThan(400);

  // Best-effort click: handle new tab vs same tab without failing the test
  const newPagePromise = context
    .waitForEvent('page', { timeout: 5000 })
    .catch(() => null);
  await checkout.click();
  const maybeNew = await newPagePromise;
  if (maybeNew) {
    await maybeNew
      .waitForURL(/\/cart\/c\//, { timeout: 10_000 })
      .catch(() => {});
    await maybeNew.close().catch(() => {});
  } else {
    await page.waitForURL(/\/cart\/c\//, { timeout: 10_000 }).catch(() => {});
  }

  // 6. Account page loads and login form visible
  await page.goto('/account', { timeout });
  await expectNo404(page);
  // Accept either a sign in button or form
  const loginForm = page
    .locator('form')
    .filter({ hasText: /email|password/i })
    .first();
  const loginButton = page
    .getByRole('button', { name: /sign in|log in/i })
    .first();
  expect(
    (await loginForm.count()) > 0 || (await loginButton.count()) > 0,
  ).toBeTruthy();
});
