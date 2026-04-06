# About Contact Desktop Nav Style Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the desktop `About` and `Contact` nav links green and underlined by default, with black hover text, without changing mobile styling.

**Architecture:** Keep the existing header rendering path and apply a small title-based style override only within the desktop plain-link branch. Leave mobile menu classes unchanged so the tweak stays tightly scoped.

**Tech Stack:** Next.js, React, TypeScript

---

### Task 1: Add desktop-only style override for About and Contact

**Files:**
- Modify: `src/components/Header.tsx`
- Test: `npm run typecheck`

**Step 1: Write the failing test**
Use the existing typecheck path for this presentation-only change.

**Step 2: Run test to verify it fails**
Run: `npm run typecheck`
Expected: PASS locally while `About` and `Contact` still use the standard non-green desktop link styling.

**Step 3: Write minimal implementation**
Detect `About` and `Contact` in the desktop top-level nav and apply green underlined text with black hover, while leaving all other links unchanged.

**Step 4: Run test to verify it passes**
Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/Header.tsx docs/plans/2026-03-11-about-contact-desktop-nav-style.md
git commit -m "fix: style about and contact desktop nav links"
```
