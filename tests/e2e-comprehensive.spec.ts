// Heavy comprehensive test - run manually or in separate CI job
import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

test.describe.skip('E2E Comprehensive Tests', () => {
const PROJECT_ROOT = path.resolve(__dirname, '..');
const API_ROUTES = ['/api/menu', '/api/product-by-handle', '/api/products', '/api/revalidate'];
const NAVIGATION_PATHS = ['/', '/cart', '/products/product1', '/collections/collection1', '/checkout'];
const RESPONSIVE_WIDTHS = [375, 768, 1024, 1440];

const AUDIT_ALLOWLIST = [
  'playwright.config.ts',
  'postcss.config.js',
  'not-found.tsx',
  'getShopifyLogo.ts',
  'tailwind.config.js',
  'e2e-comprehensive.spec.ts',
  'next-env.d.ts',
];

const FORBIDDEN_PATTERNS = [
  /eval\s*\(/i,
  /document\.write/i,
  /(?<!dangerouslySet)innerHTML\s*=/i,
  /require\(['"]child_process['"]\)/i,
];

const REQUIRED_LICENSE = /Copyright|MIT|Apache|BSD|GNU|Mozilla|ISC|license/i;

function walk(dir: string, filelist: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const filepath = path.join(dir, entry);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }
  return filelist;
}

function filteredProjectFiles() {
  return walk(PROJECT_ROOT).filter(
    (file) =>
      !file.includes('node_modules') &&
      !file.includes('.next') &&
      !file.includes('.git') &&
      !file.includes('.venv') &&
      !file.includes('test-results') &&
      !file.includes('dist') &&
      !file.includes('build') &&
      !file.includes('out') &&
      !file.endsWith('static-audit-details.log') &&
      !file.endsWith('unused-empty-todo-parse.log'),
  );
}

function fileHash(file: string) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

async function expectHeaderHasMenuItems(page: Page) {
  const nav = page.locator('nav[aria-label="Main"]');
  await expect(nav).toBeVisible();
  await expectLocatorCountGreaterThan(nav.locator('li'), 0);
  await expect(nav).not.toContainText('No navigation items found');
}

async function expectLocatorCountGreaterThan(locator: Locator, expected: number) {
  const count = await locator.count();
  expect(count).toBeGreaterThan(expected);
}

/**
 * API Health
 */
test.describe('API health', () => {
  test('all API routes return 2xx', async ({ request }) => {
    for (const api of API_ROUTES) {
      const res = await request.get(api);
      expect(res.status()).toBeGreaterThanOrEqual(200);
      expect(res.status()).toBeLessThan(300);
    }
  });
});

/**
 * Cookies & LocalStorage
 */
test.describe('Persistence', () => {
  test('cart cookie and optional theme preference persist', async ({ page, context }) => {
    await page.goto('/products/product1');
    const addBtn = page.locator('button', { hasText: /add to cart/i });
    if (await addBtn.count()) {
      await addBtn.click();
      await page.goto('/cart');
      const cookies = await context.cookies();
      expect(cookies.some((c) => /cart/i.test(c.name))).toBeTruthy();
    }
    const themeBtn = page.locator('button', { hasText: /dark|light|theme/i });
    if (await themeBtn.count()) {
      await themeBtn.click();
      const theme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(theme).toMatch(/dark|light/);
    }
  });
});

/**
 * Responsive Layout
 */
test.describe('Responsive layout', () => {
  for (const width of RESPONSIVE_WIDTHS) {
    test(`renders correctly at width ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

/**
 * Console warnings & performance
 */
test.describe('Console & performance', () => {
  test('homepage has no console warnings', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    await page.goto('/');
    expect(warnings).toHaveLength(0);
  });

  test('homepage loads quickly and without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    const start = Date.now();
    await page.goto('/');
    expect(Date.now() - start).toBeLessThan(3000);
    await expectLocatorCountGreaterThan(page.locator('img'), 0);
    await page.reload();
    expect(errors).toHaveLength(0);
  });
});

/**
 * Breadcrumbs & Metadata
 */
test.describe('Metadata & breadcrumbs', () => {
  test('product page exposes metadata', async ({ page }) => {
    await page.goto('/products/product1');
    await expect(page).toHaveTitle(/.+/);
    await expectLocatorCountGreaterThan(page.locator('meta'), 0);
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expectLocatorCountGreaterThan(jsonLd, 0);
    const breadcrumbs = page.locator('[aria-label*="breadcrumb" i]');
    if (await breadcrumbs.count()) {
      await expect(breadcrumbs).toBeVisible();
    }
  });
});

/**
 * User flows & search
 */
test.describe('User flows', () => {
  test('add to cart and navigate toward checkout', async ({ page }) => {
    await page.goto('/products/product1');
    const addBtn = page.locator('button', { hasText: /add to cart/i });
    if (await addBtn.count()) {
      await addBtn.click();
      await page.goto('/cart');
      const checkoutBtn = page.locator('a,button', { hasText: /checkout/i });
      if (await checkoutBtn.count()) {
        await checkoutBtn.first().click();
        await expect(page).toHaveURL(/checkout/);
      }
    }
  });

  test('search returns results', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count()) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      await expectLocatorCountGreaterThan(page.locator('[data-testid="search-result"]'), 0);
    }
  });
});

/**
 * Edge cases & error boundaries
 */
test.describe('Error handling', () => {
  test('404 page is accessible', async ({ page }) => {
    await page.goto('/not-a-real-page');
    const errorRegion = page.locator('[data-testid*="error" i], [role="alert"]');
    await expect(errorRegion).toBeVisible();
    await expect(errorRegion).toHaveText(/not found|404/i);
  });

  test('simulated API failure returns handled status', async ({ request }) => {
    const res = await request.get('/api/products?fail=1');
    expect([500, 400, 404]).toContain(res.status());
  });

  test('no hydration mismatches on homepage', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html).not.toContain('hydration mismatch');
  });
});

/**
 * Navigation & header
 */
test.describe('Navigation & header', () => {
  for (const route of NAVIGATION_PATHS) {
    test(`can render ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/.+/);
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('header navigation is populated on key pages', async ({ page }) => {
    for (const path of ['/', '/cart', '/products/product1']) {
      await page.goto(path);
      await expectHeaderHasMenuItems(page);
    }
  });

  test('desktop dropdowns and mobile menu operate', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();
    const triggers = nav.locator('[aria-haspopup="true"]');
    if (await triggers.count()) {
      await triggers.first().hover();
      await expect(page.locator('[role="menu"]')).toBeVisible();
    }
    await page.setViewportSize({ width: 375, height: 800 });
    const menuBtn = page.locator('button[aria-label*="menu" i]');
    if (await menuBtn.count()) {
      await menuBtn.click();
      await expect(nav).toBeVisible();
      await menuBtn.click();
    }
  });
});

/**
 * Cart & product details
 */
test.describe('Cart & product details', () => {
  test('cart interaction', async ({ page }) => {
    await page.goto('/products/product1');
    const addBtn = page.locator('button', { hasText: /add to cart/i });
    if (await addBtn.count()) {
      await addBtn.click();
      await page.goto('/cart');
      const removeBtn = page.locator('button', { hasText: /remove/i });
      if (await removeBtn.count()) {
        await removeBtn.click();
      }
    }
  });

  test('product page displays variants, images, pricing', async ({ page }) => {
    await page.goto('/products/product1');
    const variantSelect = page.locator('select');
    if (await variantSelect.count()) {
      await variantSelect.selectOption({ index: 1 });
    }
    await expectLocatorCountGreaterThan(page.locator('img'), 0);
    await expectLocatorCountGreaterThan(page.locator('[class*=price], [data-testid*=price]'), 0);
  });
});

/**
 * Accessibility
 */
test.describe('Accessibility', () => {
  test('main nav exposes ARIA labels and focus works', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toHaveAttribute('aria-label', 'Main');
    await page.keyboard.press('Tab');
    const menu = page.locator('[role="menu"]');
    if (await menu.count()) {
      await expect(menu).toBeVisible();
    }
  });
});

/**
 * Project audit (filesystem hygiene)
 */
test.describe('Project audit', () => {
  const files = filteredProjectFiles();
  const seenHashes = new Map<string, string[]>();

  test('files are not world-writable', () => {
    for (const file of files) {
      const stat = fs.statSync(file);
      expect((stat.mode & 0o002) === 0).toBeTruthy();
    }
  });

  test('no duplicate files by hash', () => {
    for (const file of files) {
      const hash = fileHash(file);
      const list = seenHashes.get(hash) ?? [];
      list.push(file);
      seenHashes.set(hash, list);
    }
    const licenseHeader = /^\/\/ Copyright \(c\) 2025 Lab Essentials\. MIT License\./;
    for (const [, hashedFiles] of seenHashes.entries()) {
      const filtered = hashedFiles.filter((f) => !f.endsWith('.map'));
      const licenseOnly = filtered.every((f) => {
        const content = fs.readFileSync(f, 'utf8').trim();
        return licenseHeader.test(content) && content.length <= 80;
      });
      const allowlisted = filtered.every((f) =>
        AUDIT_ALLOWLIST.includes(path.basename(f)),
      );
      if (!(licenseOnly || allowlisted)) {
        expect(filtered.length).toBe(1);
      }
    }
  });

  test('no oversized files (>2MB)', () => {
    for (const file of files) {
      const stat = fs.statSync(file);
      expect(stat.size).toBeLessThan(2 * 1024 * 1024);
    }
  });

  test('forbidden patterns are absent', () => {
    for (const file of files) {
      if (
        file.includes('/tests/') ||
        file.endsWith('.spec.ts') ||
        file.endsWith('.spec.js')
      )
        continue;
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(pattern.test(content)).toBeFalsy();
      }
    }
  });

  test('source files include license header', () => {
    for (const file of files) {
      if (
        (file.endsWith('.ts') || file.endsWith('.js')) &&
        !AUDIT_ALLOWLIST.includes(path.basename(file))
      ) {
        const content = fs.readFileSync(file, 'utf8');
        expect(REQUIRED_LICENSE.test(content)).toBeTruthy();
      }
    }
  });

  test('detect unused files naively', () => {
    const codeFiles = files.filter((f) => /\.(ts|tsx|js)$/.test(f));
    const combined = codeFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    for (const file of codeFiles) {
      const base = path.basename(file).replace(/\.(ts|tsx|js)$/, '');
      if (base === 'index' || AUDIT_ALLOWLIST.includes(path.basename(file))) {
        continue;
      }
      expect(new RegExp(base, 'i').test(combined)).toBeTruthy();
    }
  });

  test('all declared env vars are referenced', () => {
    const envPath = path.join(PROJECT_ROOT, '.env');
    if (!fs.existsSync(envPath)) return;
    const vars = fs
      .readFileSync(envPath, 'utf8')
      .split('\n')
      .map((line) => line.split('=')[0].trim())
      .filter(Boolean);
    const combined = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    for (const variable of vars) {
      expect(new RegExp(variable, 'i').test(combined)).toBeTruthy();
    }
  });

  test('no simple import cycles', () => {
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        const basename = path.basename(file, path.extname(file));
        expect(new RegExp(`from ['\"]\./${basename}['\"]`).test(content)).toBeFalsy();
      }
    }
  });

  test('files are readable and non-empty', () => {
    const allowedEmpty = ['.gitkeep', '.env', '.DS_Store'];
    for (const file of files) {
      expect(fs.existsSync(file)).toBeTruthy();
      expect(() => fs.readFileSync(file)).not.toThrow();
      if (allowedEmpty.some((n) => file.endsWith(n))) continue;
      const stat = fs.statSync(file);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  test('no TODO / FIXME / BUG markers remain', () => {
    for (const file of files) {
      if (
        file.includes('/tests/') ||
        file.endsWith('.spec.ts') ||
        file.endsWith('.spec.js') ||
        file.endsWith('package-lock.json')
      )
        continue;
      const content = fs.readFileSync(file, 'utf8');
      expect(/TODO|FIXME|BUG/i.test(content)).toBeFalsy();
    }
  });

  test('no .only inside tests', () => {
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        expect(/\.only\s*\(/.test(content)).toBeFalsy();
      }
    }
  });

  test('TypeScript/JS files are syntactically valid (naive)', () => {
    for (const file of files) {
      if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
        const content = fs.readFileSync(file, 'utf8');
        expect(() => new Function(content)).not.toThrow();
      }
    }
  });

  test('JSON files parse successfully', () => {
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(file, 'utf8');
        expect(() => JSON.parse(content)).not.toThrow();
      }
    }
  });
});
});
