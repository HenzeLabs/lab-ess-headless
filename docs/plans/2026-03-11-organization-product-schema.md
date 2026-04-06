# Organization Product Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement sitewide Organization schema and shared Product schema generation using factual data only.

**Architecture:** Centralize JSON-LD generation in shared SEO helpers, render Organization schema from the global layout, and update product pages to consume the shared Product/Breadcrumb builders instead of hand-rolled page-local objects. Remove duplicate homepage Organization markup so the site emits one consistent Organization schema source.

**Tech Stack:** Next.js, React, TypeScript, Shopify Storefront API, Schema.org JSON-LD

---

### Task 1: Harden shared schema generators

**Files:**
- Modify: `src/lib/seo/enhanced.ts`
- Modify: `src/lib/seo.ts`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use the existing typecheck path for this shared-helper refactor.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally while schema generation still includes hardcoded review/rating content and is not reused consistently.

**Step 3: Write minimal implementation**
Update shared schema helpers so Organization is comprehensive and Product uses only factual fields from real product data. Export the helpers through the main SEO module used by pages.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/seo/enhanced.ts src/lib/seo.ts docs/plans/2026-03-11-organization-product-schema.md
git commit -m "refactor: centralize organization and product schema"
```

### Task 2: Inject Organization schema sitewide and remove duplicate homepage Organization markup

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use implementation verification backed by typecheck for this layout-level schema change.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally while Organization schema is still homepage-only and duplicated by page-specific code.

**Step 3: Write minimal implementation**
Render shared Organization schema once in the global layout and keep homepage WebSite schema only.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/layout.tsx src/app/page.tsx docs/plans/2026-03-11-organization-product-schema.md
git commit -m "feat: add sitewide organization schema"
```

### Task 3: Switch product pages to shared Product schema builder

**Files:**
- Modify: `src/app/products/[handle]/page.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use implementation verification backed by typecheck for the product JSON-LD cleanup.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally while product pages still hand-roll Product schema objects instead of using the shared helper.

**Step 3: Write minimal implementation**
Replace page-local Product schema creation with the shared Product/Breadcrumb schema generators.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/products/[handle]/page.tsx docs/plans/2026-03-11-organization-product-schema.md
git commit -m "feat: use shared product schema on product pages"
```
