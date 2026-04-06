# Lab Equipment Product Dropdown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change the `Lab Equipment` mega-menu to show the first 5 products from the top-level Shopify `lab-equipment` collection.

**Architecture:** Replace the current Shopify collection-tile fallback for the header with a Shopify query against the top-level `lab-equipment` collection and convert its first 5 products into `MenuItem` children. Keep the existing header mega-menu UI and ordering logic unchanged so only the dropdown data source changes.

**Tech Stack:** Next.js, React, TypeScript, Shopify Storefront API, Vercel

---

### Task 1: Swap Lab Equipment dropdown data source to collection products

**Files:**
- Modify: `src/components/HeaderServer.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use the existing typecheck path for this small data-shape change.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally while the current dropdown still uses collection tiles instead of 5 top-level products.

**Step 3: Write minimal implementation**
Query Shopify for `collection(handle: "lab-equipment")`, request `products(first: 5)`, and map those products into the child menu items for the `Lab Equipment` mega-menu.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/HeaderServer.tsx docs/plans/2026-03-11-lab-equipment-product-dropdown.md
git commit -m "feat: use lab equipment products in nav dropdown"
```

### Task 2: Verify and redeploy production

**Files:**
- Modify: `src/components/HeaderServer.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use production deployment verification after local type safety.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally before deployment.

**Step 3: Write minimal implementation**
No additional code changes; deploy with `npx vercel --prod --yes`.

**Step 4: Run test to verify it passes**
Run: `npx vercel --prod --yes`
Expected: Production deployment succeeds and aliases to the live domain.

**Step 5: Commit**
```bash
git add src/components/HeaderServer.tsx docs/plans/2026-03-11-lab-equipment-product-dropdown.md
git commit -m "fix: ship lab equipment product dropdown"
```
