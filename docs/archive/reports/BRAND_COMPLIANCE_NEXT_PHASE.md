# Brand Compliance - Next Phase Roadmap

## Overview

The brand compliance system is now live in production with 100% enforcement. This document outlines the next phase of work to complete the rollout and ensure long-term maintainability.

---

## Phase 1: Snapshot Update ✅ Ready

### Objective
Lock in new brand visuals by updating Playwright baseline snapshots with the migrated brand colors.

### Current Status
- ✅ Brand colors migrated (227 violations fixed)
- ✅ UI consistency test suite created (190 tests)
- ⏳ Baselines need updating (tests currently fail due to color changes)

### Action Items

#### 1. Ensure Dev Server is Stable
```bash
# Check dev server status
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK

# Verify brand colors are applied
curl http://localhost:3000 | grep -o "hsl(var(--brand))" | wc -l
# Should show multiple matches
```

#### 2. Update Visual Baselines
```bash
# Update all UI consistency snapshots
npx playwright test tests/ui-consistency.spec.ts --update-snapshots

# Expected: 190 tests will create new baseline images
# Output: tests/ui-consistency.spec.ts-snapshots/
#   - homepage-full-Chromium-darwin.png
#   - collection-page-full-Chromium-darwin.png
#   - product-page-full-Chromium-darwin.png
#   - [187 more snapshots across 3 browsers]
```

#### 3. Verify Snapshots
```bash
# Run tests without update flag - should all pass
npx playwright test tests/ui-consistency.spec.ts

# Expected output:
# Running 190 tests using 4 workers
# 190 passed (Xm Xs)
```

#### 4. Commit Baselines
```bash
git add tests/ui-consistency.spec.ts-snapshots/
git commit -m "test: update UI baselines with brand color migration

Lock in new visual baselines after migrating all legacy colors
to Lab Essentials brand CSS variables.

- 190 snapshots updated across 3 browsers (Chromium, Firefox, Safari)
- All pages now show Bright Teal (#0D9488) CTAs
- Typography validated (Montserrat headings, Roboto body)
- Spacing consistency confirmed

Generated with Claude Code
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### Success Criteria
- ✅ 190 UI tests pass without `--update-snapshots` flag
- ✅ Snapshots directory contains ~570 PNG files (190 tests × 3 browsers)
- ✅ All CTAs render in Bright Teal (#0D9488)
- ✅ Typography uses Montserrat (headings) and Roboto (body)

### Timeline
- Estimated: 15-20 minutes (test execution time)
- Blocker: Dev server must be stable

---

## Phase 2: Staging Regression Pass 🔄 Next

### Objective
Validate that the production build pipeline correctly minifies and serves brand CSS variables.

### Why This Matters
Production builds may:
- Minify CSS differently than dev server
- Tree-shake unused variables
- Apply different optimization strategies
- Use CDN caching that could serve stale assets

### Action Items

#### 1. Build Production Version
```bash
# Create production build
npm run build

# Expected output:
# Route (app)                     Size     First Load JS
# ┌ ○ /                          X kB          XX kB
# ├ ○ /collections/[handle]      X kB          XX kB
# └ ○ /products/[handle]         X kB          XX kB
```

#### 2. Start Production Server
```bash
# Run production build locally
npm run start

# Server should start on http://localhost:3000
```

#### 3. Validate CSS Variables in Build
```bash
# Check that CSS variables are present in compiled CSS
curl http://localhost:3000 | grep -o "var(--brand)" | wc -l
# Should show multiple matches

# Verify HSL color format is preserved
curl http://localhost:3000 | grep -o "hsl(var(--brand))" | wc -l
# Should show multiple matches

# Check critical CSS includes brand tokens
curl http://localhost:3000/_next/static/css/*.css | grep --color "var(--brand)"
```

#### 4. Visual Verification
Open in browser: http://localhost:3000

**Pages to Check:**
- [x] Homepage - Hero CTA should be Bright Teal
- [x] Collections - "Add to Cart" buttons should be Bright Teal
- [x] Product Pages - Primary CTA should be Bright Teal
- [x] Support Pages - Links and buttons should be Bright Teal
- [x] 404 Page - Primary CTA should be Bright Teal

**Color Reference:**
```css
Bright Teal: #0D9488 / rgb(13, 148, 136) / hsl(175, 84%, 26%)
```

Use browser DevTools:
1. Inspect any CTA button
2. Check computed styles
3. Verify `background-color: rgb(13, 148, 136)`

#### 5. Run Lighthouse on Production Build
```bash
# Performance + Accessibility audit
npx lighthouse http://localhost:3000 \
  --only-categories=performance,accessibility \
  --output=json \
  --output-path=./lighthouse-production.json

# Check results
cat lighthouse-production.json | jq '.categories.performance.score, .categories.accessibility.score'
# Should both be > 0.9 (90%)
```

#### 6. Cross-Browser Testing
```bash
# Run full test suite against production build
npx playwright test tests/ui-consistency.spec.ts

# Should pass all 190 tests
```

### Success Criteria
- ✅ Production build completes without errors
- ✅ CSS variables present in minified output
- ✅ All CTAs render in Bright Teal (#0D9488)
- ✅ Lighthouse scores > 90% (performance + accessibility)
- ✅ All 190 UI tests pass against production build

### Potential Issues & Fixes

**Issue:** CSS variables not in production build
```bash
# Fix: Check tailwind.config.js includes CSS variable layer
# Ensure globals.css is imported in layout.tsx
```

**Issue:** Colors look different in production
```bash
# Fix: Clear Next.js cache and rebuild
rm -rf .next
npm run build
npm run start
```

**Issue:** CDN serving old assets
```bash
# Fix: Add cache-busting to _app.tsx or use versioned assets
# Check next.config.js for proper asset hashing
```

### Timeline
- Estimated: 30-45 minutes
- Blocker: Production build must complete successfully

---

## Phase 3: Extend Enforcement to CMS 📝 Future

### Objective
Ensure brand compliance extends to content managed in Shopify (rich text, metafields, content blocks).

### Current Gaps

**Unvalidated Content:**
- Shopify metafield values (HTML, rich text)
- Product descriptions with inline styles
- Collection descriptions with color overrides
- Custom liquid templates
- Marketing banners and promotional content

**Risk:**
Content editors could add:
```html
<!-- In Shopify product description -->
<span style="color: #3B82F6">Blue text</span>
<div style="background: purple">Purple background</div>
```

### Solution Approach

#### Option A: Content Validation Script
Create a script that validates Shopify content via API:

```javascript
// scripts/validate-shopify-content.js
const forbiddenPatterns = [
  /style=["'].*color:\s*#(?!0D9488)/i,     // Hex colors except brand
  /style=["'].*background:\s*(?!hsl|var)/i, // Non-CSS-variable backgrounds
  /style=["'].*color:\s*blue/i,             // Named colors
  /style=["'].*color:\s*purple/i,
];

async function validateProductDescriptions() {
  const products = await shopify.product.list();
  const violations = [];

  products.forEach(product => {
    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(product.body_html)) {
        violations.push({
          product: product.title,
          issue: `Forbidden inline style in description`,
        });
      }
    });
  });

  return violations;
}
```

**Run as:**
```bash
npm run validate:shopify-content
```

#### Option B: Shopify App Integration
Build a Shopify app that:
- Validates content on save
- Highlights non-compliant HTML
- Suggests brand-compliant alternatives
- Integrates with Shopify admin UI

#### Option C: Content Guidelines + Manual Review
Create documentation for content editors:

**Content Editor Guidelines:**
```markdown
# Lab Essentials Content Guidelines

## Approved Colors
✅ Use semantic class names:
  - `.text-brand` for teal text
  - `.bg-brand` for teal backgrounds
  - `.text-accent` for yellow accents

❌ Never use inline styles:
  - style="color: blue"
  - style="background: #3B82F6"
  - style="color: purple"

## Examples

✅ Good:
<span class="text-brand font-semibold">20% Off</span>

❌ Bad:
<span style="color: #0D9488; font-weight: 600">20% Off</span>
```

### Recommended Approach

**Phase 3A: Immediate (Manual)**
1. Audit existing Shopify content
2. Create content editor guidelines
3. Train content team on brand compliance

**Phase 3B: Near-term (Automated)**
1. Build `validate-shopify-content.js` script
2. Add to CI/CD pipeline (run nightly)
3. Email violations report to content team

**Phase 3C: Long-term (Preventive)**
1. Build Shopify app for real-time validation
2. Integrate with Shopify admin
3. Block non-compliant content on save

### Action Items (Phase 3A)

```bash
# 1. Audit current Shopify content
node scripts/audit-shopify-content.js > shopify-content-audit.txt

# 2. Review violations
cat shopify-content-audit.txt | grep "violation"

# 3. Create content guidelines
# See: docs/CONTENT_EDITOR_GUIDELINES.md

# 4. Schedule training session
# Add to calendar: "Brand Compliance Training for Content Team"
```

### Success Criteria
- ✅ All product descriptions use brand colors
- ✅ All collection descriptions use brand colors
- ✅ Content team trained on guidelines
- ✅ Automated validation runs nightly

### Timeline
- Phase 3A: 1-2 days (audit + guidelines)
- Phase 3B: 1 week (build validation script)
- Phase 3C: 2-4 weeks (Shopify app development)

---

## Phase 4: Quarterly CI Review 📅 Ongoing

### Objective
Maintain brand compliance system as palette and typography evolve.

### Review Schedule
**Frequency:** Quarterly (every 3 months)
**Next Review:** January 2026

### Review Checklist

#### 1. Color Palette Audit
```bash
# Check if brand colors have changed in globals.css
git diff HEAD~90 src/app/globals.css | grep --color "var(--brand)"

# If changed, update validation patterns
# Edit: scripts/validate-brand-tokens.js
# Edit: scripts/fix-brand-colors.js
```

#### 2. Typography Audit
```bash
# Check if font families have changed
git diff HEAD~90 src/app/layout.tsx | grep --color "font"

# If changed, update validation patterns
# Edit: lib/tailwind-brand-validator.js
```

#### 3. New Pattern Discovery
```bash
# Find any new color patterns that slipped through
grep -r "blue-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -r "purple-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -r "#[0-9A-F]{6}" src/ --include="*.tsx" --include="*.ts" | grep -v "0D9488"

# Add any new patterns to fix-brand-colors.js
```

#### 4. Test Suite Update
```bash
# Check for new pages/components
find src/app -name "page.tsx" | wc -l
# Compare to last quarter - if increased, add to ui-consistency.spec.ts

# Check for new components
find src/components -name "*.tsx" | wc -l
# Compare to last quarter - if increased, add tests
```

#### 5. Documentation Review
```bash
# Update migration report with current stats
node scripts/validate-brand-tokens.js > current-compliance.txt
# Compare to BRAND_COLOR_MIGRATION_REPORT.md
# Update if metrics changed
```

#### 6. CI/CD Performance
```bash
# Check validation script performance
time npm run validate:brand
# Should complete in < 5 seconds

# If slow, optimize validation patterns
# Consider caching or parallel processing
```

### Review Actions

**If Brand Palette Changes:**
1. Update `src/app/globals.css` with new CSS variables
2. Update `scripts/validate-brand-tokens.js` forbidden patterns
3. Update `scripts/fix-brand-colors.js` replacement mappings
4. Run migration: `node scripts/fix-brand-colors.js --dry-run`
5. Review changes, apply if needed
6. Update documentation
7. Notify team of changes

**If Typography Changes:**
1. Update `src/app/layout.tsx` font imports
2. Update `lib/tailwind-brand-validator.js` allowed fonts
3. Update `tests/ui-consistency.spec.ts` font assertions
4. Update snapshots: `npx playwright test tests/ui-consistency.spec.ts --update-snapshots`
5. Update documentation

**If New Patterns Discovered:**
1. Add to `scripts/fix-brand-colors.js` COLOR_REPLACEMENTS
2. Add to `lib/tailwind-brand-validator.js` BRAND_TOKENS.colors.forbidden
3. Run migration to fix existing instances
4. Update validation tests
5. Document in migration report

### Success Criteria
- ✅ All validation patterns up to date
- ✅ Test suite covers all pages/components
- ✅ Documentation reflects current state
- ✅ CI/CD pipeline runs efficiently (< 5s)
- ✅ Team aware of any palette/typography changes

### Timeline
- Review duration: 2-3 hours per quarter
- Update implementation: 1-2 days if changes needed

---

## Summary & Priority

### Immediate Actions (This Week)
1. ✅ **Phase 1: Snapshot Update** - Update Playwright baselines
   - Blocker: Dev server stability
   - Effort: 15-20 minutes
   - Impact: High (locks in visual regression testing)

2. 🔄 **Phase 2: Staging Regression** - Validate production build
   - Blocker: None
   - Effort: 30-45 minutes
   - Impact: High (ensures CDN serves correct assets)

### Near-term Actions (This Month)
3. 📝 **Phase 3A: Content Audit** - Review Shopify content
   - Blocker: None
   - Effort: 1-2 days
   - Impact: Medium (prevents content drift)

### Ongoing Actions (Quarterly)
4. 📅 **Phase 4: CI Review** - Maintain validation system
   - Blocker: None
   - Effort: 2-3 hours per quarter
   - Impact: High (long-term maintainability)

---

## Next Steps

**Start with Phase 1:**
```bash
# 1. Verify dev server is running
curl -I http://localhost:3000

# 2. Update snapshots
npx playwright test tests/ui-consistency.spec.ts --update-snapshots

# 3. Verify tests pass
npx playwright test tests/ui-consistency.spec.ts

# 4. Commit and push
git add tests/ui-consistency.spec.ts-snapshots/
git commit -m "test: update UI baselines with brand color migration"
git push origin main
```

**Then proceed to Phase 2:**
```bash
# 1. Build production
npm run build

# 2. Start production server
npm run start

# 3. Validate in browser
open http://localhost:3000

# 4. Run tests against production
npx playwright test tests/ui-consistency.spec.ts
```

---

**Document Version:** 1.0
**Created:** 2025-10-21
**Status:** Ready for execution
**Owner:** Lab Essentials Engineering Team
