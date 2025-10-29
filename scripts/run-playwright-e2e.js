#!/usr/bin/env node

const { spawnSync } = require('child_process');

const hasStoreDomain = Boolean(process.env.SHOPIFY_STORE_DOMAIN);
const storefrontAccessToken =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_API_TOKEN;

const missing = [];

if (!hasStoreDomain) {
  missing.push('SHOPIFY_STORE_DOMAIN');
}

if (!storefrontAccessToken) {
  missing.push('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
}

if (missing.length > 0) {
  console.warn(
    `Skipping Playwright E2E tests: missing environment variables ${missing.join(
      ', ',
    )}`,
  );
  process.exit(0);
}

const args = [
  'playwright',
  'test',
  'tests/homepage.spec.ts',
  'tests/products.spec.ts',
  'tests/cart.spec.ts',
  'tests/checkout.spec.ts',
];

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
