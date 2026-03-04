import { test, expect } from '@playwright/test';

type ShopifyPage = {
  id: string;
  title: string;
  handle: string;
  body?: string | null;
};

const ABOUT_PAGE_HANDLES = ['about-lab-essentials', 'about-us', 'about'];
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

function stripHtml(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(input: string, length = 80): string {
  return input.slice(0, length).trim();
}

test.describe('/about Shopify integration', () => {
  test('loads /about and renders main content', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/about');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
  });

  test('renders Shopify About page title and body when storefront credentials are present', async ({
    page,
    request,
  }) => {
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const storefrontToken =
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      process.env.SHOPIFY_STOREFRONT_API_TOKEN;

    test.skip(
      !storeDomain || !storefrontToken,
      'Shopify storefront env vars are not set',
    );

    const endpoint = `https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
    const query = `
      query getPageByHandle($handle: String!) {
        pageByHandle(handle: $handle) {
          id
          title
          handle
          body
        }
      }
    `;

    let shopifyPage: ShopifyPage | null = null;

    for (const handle of ABOUT_PAGE_HANDLES) {
      const response = await request.post(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken!,
        },
        data: {
          query,
          variables: { handle },
        },
      });

      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const pageByHandle = payload?.data?.pageByHandle as ShopifyPage | null;

      if (pageByHandle) {
        shopifyPage = pageByHandle;
        break;
      }
    }

    expect(
      shopifyPage,
      `No Shopify about page found for handles: ${ABOUT_PAGE_HANDLES.join(', ')}`,
    ).toBeTruthy();

    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText(shopifyPage!.title);

    const bodyText = stripHtml(shopifyPage!.body);
    if (bodyText.length > 0) {
      await expect(page.locator('article')).toContainText(excerpt(bodyText));
    }
  });
});
