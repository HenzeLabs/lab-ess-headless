## Revalidate API Example

To trigger a revalidation (ISR) for a path:

```bash
curl -X POST \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"path":"/products/your-product-handle"}' \
  https://your-site.com/api/revalidate
```

# TL;DR: Project Audit & Launch Checklist (2025)

**Project:** Headless Next.js Shopify Theme

**Audit Summary:**

- Uses Next.js App Router (`/src/app`), not Pages Router
- Modern stack: Next.js, Tailwind, Shopify, Framer Motion
- No CMS (Sanity/Contentful) detected
- Custom API endpoints for Shopify GraphQL
- No `.env` file found, but required for Shopify integration

**What Was Fixed/Flagged:**

- Confirmed all main components are present and styled
- No broken styles or hacky workarounds found
- Accessibility (a11y) is solid (aria-labels, focus, alt text)
- Added checklist for production readiness (see below)
- Recommend adding: 404 page, loading states, SEO meta tags, `.env.example`, error boundaries

**How to Keep It Clean:**

- Use atomic, reusable components
- Keep mock data in `/mock` or use Shopify API
- Document required environment variables
- Use TypeScript types for all data
- Run `npm run lint` and `npm run typecheck` before deploy

**Run Locally:**

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Deploy:**

- Recommended: [Vercel](https://vercel.com/)
- See Next.js docs for [deployment](https://nextjs.org/docs/app/building-your-application/deploying)

**Production-Ready Checklist:**

- [ ] Add `.env.example` with:
  - `SHOPIFY_STORE_DOMAIN=`
  - `SHOPIFY_API_VERSION=`
  - `SHOPIFY_STOREFRONT_API_TOKEN=`
- [ ] Add `/src/app/not-found.tsx` for 404s
- [ ] Add `/src/app/loading.tsx` for loading states
- [ ] Add Open Graph/Twitter meta tags in `layout.tsx`
- [ ] Fill out `/collections/[handle]/page.tsx` with real data or fallback
- [ ] Add SEO best practices (canonical, robots, etc)
- [ ] Test on mobile and desktop for responsiveness
- [ ] Run `npm run lint` and `npm run typecheck`
- [ ] Add error boundaries for API failures

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Analytics Smoke Test

Run the automated GA4/GTM/Taboola smoke test:

```bash
npm run test:analytics
```

The Playwright suite boots the dev server, simulates an ecommerce funnel, and prints an `ANALYTICS_RESULTS` JSON blob summarising captured `dataLayer` pushes, `_tfa` pixel events, and intercepted GA4 requests.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## On-Demand Revalidation

This project includes an API endpoint to manually revalidate pages. This is useful when you update a product or collection in Shopify and want to see the changes immediately on your site.

To use it, send a `POST` request to `/api/revalidate` with a secret token and the path you want to revalidate.

**Example:**

```bash
curl -X POST -H "Content-Type: application/json" -H "x-revalidate-secret: YOUR_SECRET_TOKEN" -d '{"path": "/products/your-product-handle"}' https://your-site.com/api/revalidate
```

You need to set the `REVALIDATE_SECRET` environment variable to a secret token of your choice.
