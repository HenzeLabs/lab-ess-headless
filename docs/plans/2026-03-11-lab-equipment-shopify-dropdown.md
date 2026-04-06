# Lab Equipment Shopify Dropdown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the `Lab Equipment` nav item open the same mega-menu dropdown as the other category items, with child tiles sourced from Shopify collection data.

**Architecture:** Build a Shopify-backed set of Lab Equipment child menu items on the server and attach them to the `Lab Equipment` top-level menu item during header menu assembly. Reuse the existing header mega-menu rendering path by ensuring the parent item has `items` and `hasMegaMenu` populated, while keeping the menu order logic intact.

**Tech Stack:** Next.js, React, TypeScript, Shopify Storefront API, Vercel

---

### Task 1: Define shared Lab Equipment collection handles

**Files:**
- Create: `src/lib/navigation/labEquipmentCollections.ts`
- Modify: `src/app/collections/page.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use the existing typecheck path for this shared-constant refactor.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally before refactor.

**Step 3: Write minimal implementation**
Extract the Lab Equipment collection handles into a shared module and import them into the collections page so the header and collections page use the same Shopify handles.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/navigation/labEquipmentCollections.ts src/app/collections/page.tsx docs/plans/2026-03-11-lab-equipment-shopify-dropdown.md
git commit -m "refactor: share lab equipment collection handles"
```

### Task 2: Attach Shopify-backed children to the Lab Equipment nav item

**Files:**
- Modify: `src/components/HeaderServer.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use deterministic implementation verification because the current UI lacks a focused automated nav test.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally while `Lab Equipment` still has no child `items`, so it cannot open the mega-menu.

**Step 3: Write minimal implementation**
Fetch Shopify collections for the Lab Equipment handles, turn them into `MenuItem` children with Shopify titles/images/URLs, and attach them to the `Lab Equipment` parent while preserving the requested nav order.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/HeaderServer.tsx docs/plans/2026-03-11-lab-equipment-shopify-dropdown.md
git commit -m "feat: add shopify-backed lab equipment dropdown"
```

### Task 3: Verify and redeploy production

**Files:**
- Modify: `src/components/HeaderServer.tsx`
- Modify: `src/app/collections/page.tsx`
- Modify: `src/lib/navigation/labEquipmentCollections.ts`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use a deployment verification pass after local type safety.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally before deployment.

**Step 3: Write minimal implementation**
No more code changes; deploy with `npx vercel --prod --yes`.

**Step 4: Run test to verify it passes**
Run: `npx vercel --prod --yes`
Expected: Production deployment succeeds and aliases to the live domain.

**Step 5: Commit**
```bash
git add src/components/HeaderServer.tsx src/app/collections/page.tsx src/lib/navigation/labEquipmentCollections.ts docs/plans/2026-03-11-lab-equipment-shopify-dropdown.md
git commit -m "feat: ship lab equipment shopify dropdown"
```
