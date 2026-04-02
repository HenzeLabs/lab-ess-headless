# Lab Essentials Headless — Punch List Handoff

**Date:** 2026-04-02
**Status:** All 6 features implemented, uncommitted on `main`. Needs: merge cart cross-sell worktree, review, commit, build verify, deploy.

---

## What Was Done

6 agents ran in parallel, each tackling one punch list item. All builds passed individually.

### 1. GTM Audit — Remove Duplicate Tracking
- All direct `gtag()` event calls → `dataLayer.push()` (6 files)
- Added missing `value` param to `view_item`, `view_item_list`, `select_item` (GA4 spec)
- `G-QCSHJ4TDMY` was already clean (not in active source files)
- **Files:** `analytics.ts`, `analytics-tracking.ts`, `analytics-tracking-enhanced.ts`, `analytics/manager.ts`, `header/Search.tsx`, `optimization/TestConfig.ts`

### 2. Cart Cross-Sell Section
- **In worktree branch `worktree-agent-a61d3af8` — must merge first**
- New `CartCrossSell.tsx` — 4 products, horizontal scroll mobile / grid desktop
- New `api/cross-sell/route.ts` — Shopify `productRecommendations` with featured collection fallback
- `cart/page.tsx` — cross-sell rendered between items and TrustSignals
- Analytics: `trackAddToCart`, `trackSelectItem`

### 3. Klaviyo Integration
- New `src/lib/klaviyo.ts` — consent-gated script loader with event queue
- Hooks into `trackViewItem`, `trackAddToCart`, `trackBeginCheckout`
- `EmailSignup.tsx` — calls `klaviyoIdentify()` on signup
- `layout.tsx` — swapped Facebook dns-prefetch → Klaviyo
- `.env.example` — documented `NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY`
- **ACTION REQUIRED:** Set `NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY` in `.env.local` and Vercel

### 4. Cookie Consent Banner
- `CookieConsent` rendered in `layout.tsx` (was built but never mounted)
- Consent Mode V2 defaults changed: `denied` → `granted` on user action
- Clarity + analytics lazy-load gated behind consent
- Dispatches `marketing-consent-granted` event (for Klaviyo)

### 5. Buy Now / Express Checkout
- `ProductInfoPanel.tsx` — Buy Now button (outline + lightning bolt icon)
- `StickyAddToCart.tsx` — Buy Now in sticky mobile bar
- `api/cart/route.ts` — `forceNew` param creates separate cart for express checkout
- Analytics: `trackBeginCheckout` on click

### 6. Customer Reviews
- New `src/lib/reviews.ts` — types, mock data (8 reviews across 4 products), helpers
- New `src/components/reviews/` — StarRatingInput, ReviewForm, ReviewCard, ProductReviewsSection
- New `src/app/api/reviews/route.ts` — GET/POST (MVP logs submissions, no persistence yet)
- Product pages: reviews section + AggregateRating JSON-LD for SEO
- Star ratings on `ProductCard` (collections) and `ProductInfoPanel` (anchors to #reviews)
- `/reviews` page updated with grouped reviews
- **Mock data for MVP** — swap data source when ready

---

## Merge Order

```
1. Merge worktree: git merge worktree-agent-a61d3af8
   (adds CartCrossSell.tsx, api/cross-sell/route.ts, modifies cart/page.tsx)
2. Resolve any conflicts in cart/page.tsx (unlikely — other agents didn't touch it)
3. npm run build
4. Review all changes: git diff HEAD
5. Commit everything
```

---

## Files Changed

**New files (10):**
- `src/lib/klaviyo.ts`
- `src/lib/reviews.ts`
- `src/components/reviews/StarRatingInput.tsx`
- `src/components/reviews/ReviewForm.tsx`
- `src/components/reviews/ReviewFormWrapper.tsx`
- `src/components/reviews/ReviewCard.tsx`
- `src/components/reviews/ProductReviewsSection.tsx`
- `src/app/api/reviews/route.ts`
- `src/app/api/cross-sell/route.ts` *(worktree)*
- `src/components/CartCrossSell.tsx` *(worktree)*

**Modified files (20+):**
- `.env.example`, `AnalyticsWrapper.tsx`, `layout.tsx`, `api/cart/route.ts`
- `products/[handle]/page.tsx`, `ProductInfoPanelClient.tsx`
- `reviews/page.tsx`, `CookieConsent.tsx`, `EmailSignup.tsx`
- `ProductCard.tsx`, `ProductInfoPanel.tsx`, `StarRating.tsx`, `StickyAddToCart.tsx`
- `header/Search.tsx`, `optimization/TestConfig.ts`
- `analytics.ts`, `analytics-tracking.ts`, `analytics-tracking-enhanced.ts`, `analytics/manager.ts`

---

## Pre-Deploy Checklist

- [ ] Merge cart cross-sell worktree into main
- [ ] Set `NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY` in `.env.local` and Vercel env vars
- [ ] `npm run build` — verify clean
- [ ] Test cookie consent banner (first visit → accept/reject/preferences)
- [ ] Test Buy Now flow on a product page
- [ ] Test cart cross-sell renders with products
- [ ] Test Klaviyo script loads after marketing consent
- [ ] Verify GTM events in Tag Assistant (no duplicate gtag calls)
- [ ] Test reviews section on product pages
- [ ] Test star ratings on collection page product cards
- [ ] Commit all changes
- [ ] Push and verify Vercel deploy
