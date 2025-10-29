# UI Consistency Quick Reference

Quick commands for maintaining Lab Essentials brand consistency.

## 🚀 Daily Commands

### Before Committing Code
```bash
# Run all consistency checks
npm run lint:css:fix && npm run validate:brand && npm run test:ui
```

### After Design Changes
```bash
# Update visual baselines
npm run test:ui:update
git add tests/__screenshots__
git commit -m "Update visual baselines: [describe changes]"
```

## 📋 Common Tasks

### Fix CSS Issues
```bash
npx stylelint "src/**/*.css" --fix
```

### Check Brand Token Compliance
```bash
npm run validate:brand
```

### Run Visual Tests (Specific Suite)
```bash
# Typography only
npx playwright test tests/ui-consistency.spec.ts -g "Typography"

# Colors only
npx playwright test tests/ui-consistency.spec.ts -g "Color"

# Spacing only
npx playwright test tests/ui-consistency.spec.ts -g "Spacing"
```

### Debug Visual Test
```bash
# Run in headed mode (see browser)
npx playwright test tests/ui-consistency.spec.ts --headed

# Run with trace
npx playwright test tests/ui-consistency.spec.ts --trace on
npx playwright show-trace trace.zip
```

## ✅ Brand Guidelines Cheat Sheet

### Colors (Use CSS Variables)
```tsx
// ✅ CORRECT
className="bg-[hsl(var(--brand))]"           // Teal
className="text-[hsl(var(--foreground))]"    // Text color

// ❌ WRONG
className="bg-[#0D9488]"                     // Hardcoded
className="bg-teal-500"                      // Tailwind color
style={{ color: 'purple' }}                 // Named color
```

### Fonts (Use CSS Variables)
```tsx
// ✅ CORRECT
className={textStyles.h1}                    // Uses var(--font-heading)
className={textStyles.body}                  // Uses var(--font-sans)

// ❌ WRONG
style={{ fontFamily: 'Montserrat' }}        // Hardcoded
className="font-sans"                        // Generic Tailwind
```

### Spacing (Use Tailwind or Rem)
```tsx
// ✅ CORRECT
className="mt-12 mb-16"                      // Tailwind spacing
className="py-section"                       // Custom spacing token

// ❌ WRONG
style={{ marginTop: '47px' }}                // Odd pixel value
className="mt-[73px]"                        // Not on 4px grid
```

## 🔍 Visual Test Results

### Passing Test
```
✓ Collection Page - Header (1.2s)
```
Screenshot matches baseline within tolerance. No action needed.

### Failing Test
```
✗ Product Page - Add to Cart Button (0.8s)
  Diff: tests/__screenshots__/product-page-add-to-cart-button-diff.png
```

**Next Steps:**
1. Open `-diff.png` to see what changed
2. If intentional: `npm run test:ui:update`
3. If unintentional: Fix CSS and re-run

## 🎨 Brand Tokens Reference

### Color Palette
```css
--brand              /* #0D9488 Teal (primary CTA) */
--brand-dark         /* Darker teal (hover state) */
--accent             /* Orange (secondary actions) */
--background         /* Page background */
--foreground         /* Primary text */
--muted              /* Secondary text */
--border             /* Border color */
```

### Typography
```css
--font-heading       /* Montserrat (H1-H6) */
--font-sans          /* Roboto (body text) */
--font-mono          /* Roboto Mono (code) */
```

### Spacing Scale
```css
--space-section      /* 3.5rem = 56px */
--space-section-lg   /* 5rem = 80px */
--space-gutter       /* 1.5rem = 24px */
```

## 🐛 Common Issues & Fixes

### "Unknown at-rule @tailwind"
**Solution:** Already configured in `.stylelintrc.json`. If persists, restart editor.

### "Large px value found"
**Solution:** Convert to rem or use Tailwind spacing scale.
```tsx
// ❌ Wrong
style={{ padding: '48px' }}

// ✅ Right
className="p-12"  // 48px = 3rem = p-12
```

### Visual test fails with minor diff
**Solution:** Adjust tolerance in test file.
```typescript
await expect(page).toHaveScreenshot('page.png', {
  maxDiffPixels: 200,  // Increase tolerance
});
```

## 📦 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run test:ui` | Run visual regression tests |
| `npm run test:ui:update` | Update baseline screenshots |
| `npm run lint:css` | Lint CSS files |
| `npm run lint:css:fix` | Auto-fix CSS issues |
| `npm run validate:brand` | Check brand token compliance |

## 📸 Screenshot Locations

```
tests/
└── __screenshots__/
    ├── homepage-full.png                    # Baseline
    ├── homepage-full-actual.png             # Current
    ├── homepage-full-diff.png               # Diff (if failing)
    ├── collection-page-header.png
    ├── product-page-add-to-cart-button.png
    └── ...
```

## 🎯 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| Font mismatch | `npx playwright install --force && npm run test:ui:update` |
| Hardcoded color found | Replace with `hsl(var(--brand))` or appropriate CSS variable |
| Spacing inconsistent | Use Tailwind spacing (mt-4, p-8) or spacing tokens |
| Screenshot diff too large | Review changes, update baseline if intentional |

## 📞 Need Help?

1. Check full documentation: `UI_CONSISTENCY_TESTING.md`
2. View implementation details: `UI_CONSISTENCY_IMPLEMENTATION.md`
3. Review brand guidelines: `src/app/globals.css` (CSS variables)
4. Check UI library: `src/lib/ui.ts` (typography & button styles)

---

**Quick Reminder:** Always run `npm run test:ui` before committing visual changes! 🎨
