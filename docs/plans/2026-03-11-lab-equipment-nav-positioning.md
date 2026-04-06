# Lab Equipment Nav Positioning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the `Lab Equipment` nav item to the correct desktop/mobile position and make it inherit the standard black navigation styling.

**Architecture:** Keep the source of truth in the server-side menu assembly so the item is injected only when missing, but insert it relative to the existing collection item instead of appending it blindly. Update the client header rendering so plain links, including `Lab Equipment`, use the same neutral text styling as the other primary nav items.

**Tech Stack:** Next.js, React, TypeScript, Vercel

---

### Task 1: Reorder injected nav item in server menu assembly

**Files:**
- Modify: `src/components/HeaderServer.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use a deterministic code-path check instead of adding a new test for this small tweak.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally, while the current UI still places `Lab Equipment` at the end of the nav.

**Step 3: Write minimal implementation**
Update `ensureLabEquipmentNavItem` so it inserts `Lab Equipment` immediately after the incubators/slide preparation item when present, with append fallback if the anchor item is absent.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/HeaderServer.tsx docs/plans/2026-03-11-lab-equipment-nav-positioning.md
git commit -m "fix: place lab equipment nav item after incubators"
```

### Task 2: Normalize desktop nav styling

**Files:**
- Modify: `src/components/Header.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use implementation inspection backed by typecheck for this presentation-only tweak.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally, while the current UI still renders plain links with the green link-button styling.

**Step 3: Write minimal implementation**
Change plain desktop nav items to render with the same neutral black treatment as the main nav instead of the green link variant.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/Header.tsx docs/plans/2026-03-11-lab-equipment-nav-positioning.md
git commit -m "fix: normalize desktop nav link styling"
```
