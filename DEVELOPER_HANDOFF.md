# Developer Handoff

## Environment Variables

Set these in `.env.local` and your deployment provider:

- `SHOPIFY_STORE_DOMAIN` — e.g. `yourstore.myshopify.com`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — Storefront access token (canonical)
  - Backwards compatible: `SHOPIFY_STOREFRONT_API_TOKEN` also works
- `SHOPIFY_API_VERSION` — e.g. `2025-01`
- `NEXT_PUBLIC_SITE_URL` — public site base URL
- `REVALIDATE_SECRET` — for `/api/revalidate` (optional)

## Cart API

`/api/cart` implements GET/POST/PATCH/DELETE using Shopify Storefront Cart APIs and the `cartId` cookie. The cart page consumes this endpoint and expects JSON `{ cart }`.

## CI: Playwright Smoke

Workflow: `.github/workflows/playwright-smoke.yml` runs a minimal smoke against a local dev server on port 3010.

Required GitHub Actions secrets:

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`

Command run:

```
PORT=3010 npx playwright test tests/shopify-core-flow.spec.ts --reporter=line
```
