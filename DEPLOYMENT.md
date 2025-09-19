# Deployment Guide

This app is a Next.js 15 site with Tailwind and a Shopify Storefront API backend.
Follow these steps to deploy safely without breaking Shopify, Tailwind, or runtime config.

## 1) Configure Environment Variables

Copy `.env.example` to `.env.local` (or set in your hosting provider):

- `SHOPIFY_STORE_DOMAIN` (e.g. `my-store.myshopify.com`)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (public Storefront token)
- `NEXT_PUBLIC_SITE_URL` (no trailing slash)
- Optional: `SHOPIFY_API_VERSION` (defaults to `2025-01`)

## 2) Local Checks

Run the safe checks locally before pushing:

```sh
npm ci
npm run check:safe
```

This runs: TypeScript, ESLint, Next build, and a targeted Playwright slice (functional + a11y).

## 3) Deploy Options

- Vercel

  - Connect the repo, set env vars in Project Settings → Environment Variables.
  - Framework Preset: Next.js. Build command `next build`. Output handled by Vercel.
  - After first deploy, validate `/` and `/cart` and run Lighthouse.

- Netlify

  - Build command: `next build`. Publish: `.next` handled by Next Runtime plugin.
  - Install Next Runtime plugin if needed.

- Docker (advanced)
  - Use multi-stage build: `node:18` → `next build` → serve with `next start`.
  - Pass env vars at runtime.

## 4) Post-Deploy Checklist

- Pages render: Home, Collections, Product, Cart.
- Cart interactions: quantity change, remove, checkout URL opens.
- Images load from allowed domains.
- No console errors or 4xx/5xx in Network tab.
- Lighthouse: acceptable Performance/A11y/Best Practices/SEO.

## 5) Troubleshooting

- Missing Shopify env → 500 errors from Storefront client. Ensure token/domain.
- CSP blocking images or scripts → check `next.config.mjs` headers.
- Build-time type or lint errors → run `npm run check:safe` locally.
