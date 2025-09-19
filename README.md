## Lab Essentials — Headless Next.js + Shopify

> A production-ready headless storefront built on Next.js App Router, Tailwind, and Shopify Storefront API. Includes strong a11y baselines, Playwright test suites, Lighthouse integration, and a lightweight design system.

This README is written so a new engineer or LLM agent can navigate, extend, and deploy the app confidently without breaking critical boundaries (Shopify, API routes, Tailwind tokens).

## Overview

- Framework: Next.js 15 (App Router) with React 19
- Styling: Tailwind (utility-first), small UI layer in `src/components/ui/*`
- Ecommerce: Shopify Storefront API via typed client (`src/lib/shopify.ts`)
- Data: SSR/edge-safe API routes in `src/app/api/*`, plus fetch helpers in `src/lib/*`
- Tests: Playwright (functional, a11y, perf/SEO, visual)
- Performance/A11y: Lighthouse CI config and Playwright a11y checks

## Repo Structure

```
src/
  app/                # App Router pages, layouts, API routes
  components/         # UI components (client/server), TrustSignals, Header, Footer, etc.
  lib/                # Shopify client, cart helpers, queries, SEO helpers, UI tokens
  styles/             # Global styles (Tailwind)
tests/                # Playwright specs (functional, a11y, SEO, perf, visual)
tools/                # Utility scripts (e.g., shopify cleanup)
public/               # Static assets
```

Key files:

- `src/lib/shopify.ts`: Typed Storefront client; requires env vars; handles retries and errors
- `src/lib/cart.ts`: Cart operations; used by `/app/cart` UI and `/app/api/cart` route
- `src/lib/ui.ts`: Layout/text/button tokens and classes for consistency
- `src/app/cart/page.tsx`: Cart UI (flat cards, subtle borders, strong CTA)
- `src/components/TrustSignals.tsx`: Trust signals block with responsive badges grid
- `next.config.mjs`: Image allowlist, CSP headers

## Environment Variables

Copy `.env.example` → `.env.local` or configure in your hosting provider:

- `SHOPIFY_STORE_DOMAIN` — e.g. `my-store.myshopify.com`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — Storefront API token (public scope)
- `NEXT_PUBLIC_SITE_URL` — canonical site URL (no trailing slash)
- Optional: `SHOPIFY_API_VERSION` (defaults to `2025-01`)
- Optional: `ANALYZE=true` to enable bundle analyzer

Shopify client throws if vars are missing. Do not commit secrets.

## Scripts

- `dev` — Start Next dev server
- `build` — Production build
- `start` — Start production server
- `lint` — ESLint (errors only)
- `typecheck` — TypeScript no-emit check
- `analyze` — Build with bundle analyzer
- `lh` — Lighthouse CI autorun
- Playwright test slices:
  - `test:functional` — core flows
  - `test:a11y` — automated accessibility checks
  - `test:seo`, `test:perf`, `test:visual`, `test:e2e`
- `check:safe` — Typecheck + Lint + Build + (functional + a11y) tests

Quick start:

```bash
npm ci
npm run dev
```

Pre-deploy gate:

```bash
npm run check:safe
```

## Design System & Tokens

- Tailwind utilities extended with CSS custom props in classNames: `bg-[hsl(var(--bg))]`, `text-[hsl(var(--ink))]`, `text-[hsl(var(--muted-foreground))]`, `border-[hsl(var(--border))]`, `bg-[hsl(var(--surface))]`, `bg-[hsl(var(--brand))]`, `bg-[hsl(var(--accent))]`.
- UI helpers in `src/lib/ui.ts`:
  - `layout.container`, `layout.section`
  - `buttonStyles.{primary,accent,ghost,outline,link}`
  - `textStyles.{heading,subheading}`
- Keep surfaces flat; use subtle borders for elevation; avoid heavy shadows in cart and summary cards.

## App Architecture

- App Router (`src/app`) with server/client components as needed.
- API routes under `src/app/api/*` handle Shopify operations server-side.
- Shopify Storefront access via `shopifyFetch<T>(...)` with retry and error handling.
- SEO helpers/sitemaps in `src/app/robots.ts` and `src/app/sitemap.ts` with `NEXT_PUBLIC_SITE_URL`.

Cart specifics:

- `src/app/cart/page.tsx`: Minimal, conversion-focused layout. Items 2/3, summary 1/3 at `lg`; stacked on mobile.
- Prices formatted to two decimals and currency code. Checkout CTA is accent, full-width, with clear hover.
- `TrustSignals` sits below summary, full width, badges in 1-col mobile / 2-col md grid.

## Testing

- All tests (Playwright):

```bash
npx playwright test
```

- Targeted slices:

```bash
npm run test:functional
npm run test:a11y
```

- View last report:

```bash
npx playwright show-report
```

## Deployment

See `DEPLOYMENT.md` for detailed steps.

Fast path (Vercel):

- Connect repo → set env vars → deploy. Build command: `next build`.
- Images/CSP preconfigured in `next.config.mjs`.

## Safe Mode (For LLM/Agents)

Do not modify without explicit approval:

- `src/lib/shopify.ts`, `src/lib/cart.ts`, `src/lib/queries/**`, `src/app/api/**`
- `next.config.mjs`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`

Required workflow for any change:

1. Read the target files and propose the diff first
2. Keep changes minimal and scoped; no API shape changes or exports renames
3. Run: `npm run typecheck && npm run lint && npm run build`
4. Run targeted tests: `npm run test:functional && npm run test:a11y`
5. If any check fails, adjust or revert before submitting

## Troubleshooting

- Shopify errors (500/GraphQL): verify `SHOPIFY_STORE_DOMAIN` + token; check API version
- CSP/image blocks: ensure domains are in `next.config.mjs` image `remotePatterns` and headers
- TypeScript eslint warning about version range: currently harmless; we pin ESLint parser range; CI still passes
- Dev port in use: Next will pick another port automatically
- A11y failures: prefer `text-[hsl(var(--muted-foreground))]` for subtle text; ensure contrast ≥ AA

## PR Checklist

- [ ] Scoped diffs; no drive-by refactors
- [ ] `npm run check:safe` passes
- [ ] A11y/contrast ok on key templates (home, product, cart)
- [ ] No new deps without approval
- [ ] Env vars documented if new behavior requires them

## Revalidate API Example

Trigger on-demand ISR for a path:

```bash
curl -X POST \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"path":"/products/your-product-handle"}' \
  https://your-site.com/api/revalidate
```

---

Questions? See `DEPLOYMENT.md`, `TROUBLESHOOTING.md`, and the Playwright reports in `playwright-report/`.
