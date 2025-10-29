# UI Consistency Testing Guide

Complete guide for maintaining visual consistency and brand compliance across the Lab Essentials headless storefront.

## Table of Contents
- [Visual Regression Testing](#visual-regression-testing)
- [CSS Linting](#css-linting)
- [Brand Token Validation](#brand-token-validation)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Visual Regression Testing

### Overview
Automated Playwright tests that screenshot each template and compare against baseline images to catch unintended visual changes.

### Running Tests

#### Generate Baseline Screenshots (First Time)
```bash
# Generate baseline screenshots for all templates
npm run test:visual:update

# Or with Playwright directly
npx playwright test tests/ui-consistency.spec.ts --update-snapshots
```

#### Run Visual Regression Tests
```bash
# Run all UI consistency tests
npm run test:visual

# Or with Playwright directly
npx playwright test tests/ui-consistency.spec.ts

# Run specific test suite
npx playwright test tests/ui-consistency.spec.ts -g "Typography Validation"
npx playwright test tests/ui-consistency.spec.ts -g "Color Token Validation"
```

#### View Test Report
```bash
npx playwright show-report
```

### Test Coverage

The UI consistency suite tests:

#### 1. **Full Page Screenshots**
- Homepage baseline
- Collection pages
- Product pages
- Support pages (contact, FAQ, shipping, returns, warranty)
- 404 error page

#### 2. **Component-Level Screenshots**
- Header (all pages)
- Footer (all pages)
- Hero sections
- Product cards
- CTA buttons
- Page titles

#### 3. **Typography Validation**
- ✅ Font families (Montserrat for headings, Roboto for body)
- ✅ Heading hierarchy (exactly one H1 per page)
- ✅ Font weights and sizes

#### 4. **Color Token Validation**
- ✅ Brand color usage in CTAs (teal #0D9488)
- ✅ Consistent background colors
- ✅ No hardcoded color values

#### 5. **Spacing Validation**
- ✅ Consistent section padding (48px/64px)
- ✅ Container max-width (1152px = 72rem)
- ✅ Responsive spacing scales

### Understanding Test Results

#### Passing Tests
```
✓ Homepage - Full Page Screenshot
✓ Collection Page - Header
✓ Product Page - Add to Cart Button
```
All visual elements match baseline within acceptable tolerance.

#### Failing Tests
```
✗ Collection Page - Product Card
  Expected: tests/__screenshots__/collection-page-product-card.png
  Received: tests/__screenshots__/collection-page-product-card-actual.png
  Diff: tests/__screenshots__/collection-page-product-card-diff.png
```

**Next Steps:**
1. Open the `-diff.png` file to see highlighted differences
2. If changes are intentional (new design), update baseline: `npm run test:visual:update`
3. If changes are unintentional, fix the CSS/components

### Configuration

Edit `tests/ui-consistency.spec.ts` to:
- Add new templates to test
- Adjust pixel difference tolerance (`maxDiffPixels`)
- Add new component regions
- Customize viewport sizes

```typescript
// Example: Add new template
{
  name: 'Cart Page',
  url: '/cart',
  regions: [
    { name: 'Header', selector: 'header' },
    { name: 'Cart Items', selector: '[data-testid="cart-items"]' },
    { name: 'Checkout Button', selector: '[data-testid="checkout-button"]' },
  ],
}
```

---

## CSS Linting

### Overview
Stylelint enforces CSS best practices and catches common mistakes.

### Installation
```bash
npm install --save-dev stylelint stylelint-config-standard stylelint-order
```

### Running Stylelint

```bash
# Lint all CSS files
npx stylelint "src/**/*.css"

# Lint and auto-fix
npx stylelint "src/**/*.css" --fix

# Lint specific file
npx stylelint src/app/globals.css
```

### Rules Enforced

The `.stylelintrc.json` configuration enforces:

#### ✅ Color Rules
- **No named colors**: Use hex or CSS variables instead of `red`, `blue`, etc.
- **Long hex format**: `#0D9488` instead of `#0D9`
- **No duplicate properties**: Catches copy-paste errors

#### ✅ Typography Rules
- **Font family quotes**: Always quote font names with spaces
- **Numeric font weights**: Use `700` instead of `bold`

#### ✅ Code Quality
- **No !important**: Prevents specificity issues
- **Alphabetical properties**: Improves readability
- **No redundant longhand**: Use shorthand properties

#### ✅ Tailwind Support
- Ignores `@tailwind`, `@apply`, `@layer` directives
- Ignores `theme()` and `screen()` functions

### Custom Rules for Lab Essentials

Edit `.stylelintrc.json` to add custom rules:

```json
{
  "rules": {
    "color-hex-case": "lower",
    "color-hex-length": "long",
    "color-named": "never",
    "declaration-no-important": true
  }
}
```

---

## Brand Token Validation

### Overview
Custom Tailwind plugin enforces Lab Essentials brand consistency by validating colors, fonts, and spacing.

### Installation

Add to `tailwind.config.ts`:

```typescript
import brandValidator from './lib/tailwind-brand-validator';

export default {
  plugins: [
    brandValidator,
    // ... other plugins
  ],
};
```

### Brand Tokens

#### ✅ Allowed Colors (CSS Variables)
```css
--brand           /* Teal #0D9488 */
--brand-dark      /* Darker teal for hover states */
--accent          /* Orange for secondary actions */
--background      /* Page background */
--foreground      /* Primary text color */
--muted           /* Secondary text color */
--border          /* Border color */
```

#### ❌ Forbidden Colors
- Hardcoded hex: `#0D9488` (use `hsl(var(--brand))` instead)
- Named colors: `purple`, `blue`, `violet`
- Old Tailwind colors: `blue-500`, `purple-600`

#### ✅ Allowed Fonts
```css
var(--font-heading)  /* Montserrat */
var(--font-sans)     /* Roboto */
var(--font-mono)     /* Roboto Mono */
```

#### ❌ Forbidden Fonts
- Generic fallbacks without CSS var: `Arial`, `Helvetica`, `sans-serif`
- System fonts: `Times`, `serif`

### Running Validation

```bash
# During build (automatic)
npm run build

# Manual validation
node -e "
const { validateBrandCompliance } = require('./lib/tailwind-brand-validator');
const fs = require('fs');
const content = fs.readFileSync('src/app/globals.css', 'utf8');
const violations = validateBrandCompliance('globals.css', content);
console.log(violations);
"
```

### Violation Examples

#### ❌ Color Violation
```tsx
// BAD: Hardcoded color
<button className="bg-[#0D9488]">Click me</button>

// GOOD: CSS variable
<button className="bg-[hsl(var(--brand))]">Click me</button>
```

#### ❌ Font Violation
```css
/* BAD: Hardcoded font */
h1 { font-family: 'Montserrat', sans-serif; }

/* GOOD: CSS variable */
h1 { font-family: var(--font-heading), sans-serif; }
```

#### ❌ Spacing Violation
```tsx
// BAD: Large hardcoded px value
<div style={{ marginTop: '47px' }}>

// GOOD: Tailwind spacing or rem
<div className="mt-12"> {/* 48px / 3rem */}
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/ui-consistency.yml`:

```yaml
name: UI Consistency Checks

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run visual regression tests
        run: npm run test:visual

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  css-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Stylelint
        run: npx stylelint "src/**/*.css"

      - name: Run brand token validation
        run: node scripts/validate-brand-tokens.js

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
```

### Pre-commit Hooks

Install Husky for git hooks:

```bash
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky init
```

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linters on staged files
npx lint-staged

# Run quick visual regression on changed components
npm run test:visual:quick
```

Configure `package.json`:

```json
{
  "lint-staged": {
    "*.css": [
      "stylelint --fix",
      "git add"
    ],
    "*.{ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

---

## Troubleshooting

### Visual Tests Failing Unexpectedly

**Symptom**: Tests fail after font or browser updates

**Solution**:
```bash
# Clear Playwright cache and reinstall browsers
npx playwright install --force

# Regenerate all baselines
npm run test:visual:update
```

### Stylelint Errors in Tailwind Classes

**Symptom**: `Unknown at-rule @tailwind`

**Solution**: Already configured in `.stylelintrc.json`:
```json
{
  "rules": {
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["tailwind", "apply", "layer"]
      }
    ]
  }
}
```

### Brand Validator False Positives

**Symptom**: Validation fails on allowed CSS variable usage

**Solution**: Update `lib/tailwind-brand-validator.js`:
```javascript
// Add to allowed patterns
if (content.includes(`hsl(var(--brand))`)) {
  // Skip validation for CSS variables
  return;
}
```

### Large Screenshot Diffs

**Symptom**: Minor rendering differences cause failures

**Solution**: Adjust tolerance in test:
```typescript
await expect(page).toHaveScreenshot('page.png', {
  maxDiffPixels: 200,  // Increase tolerance
  threshold: 0.2,      // Allow 20% difference
});
```

---

## Best Practices

### 1. Update Baselines Deliberately
- Review all visual changes before updating baselines
- Get design approval for intentional changes
- Document why baselines were updated in commit message

### 2. Run Tests Locally
```bash
# Before committing
npm run test:visual
npx stylelint "src/**/*.css" --fix
```

### 3. Keep Baselines in Version Control
- Commit baseline screenshots to git
- Use Git LFS for large screenshot files if needed

### 4. Review Diffs Carefully
- Check `-diff.png` files for unexpected changes
- Look for font rendering, color shifts, spacing issues

### 5. Test Responsive Breakpoints
```typescript
// Add mobile/tablet viewports
test.use({ viewport: { width: 375, height: 667 } }); // Mobile
test.use({ viewport: { width: 768, height: 1024 } }); // Tablet
```

---

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:visual": "playwright test tests/ui-consistency.spec.ts",
    "test:visual:update": "playwright test tests/ui-consistency.spec.ts --update-snapshots",
    "test:visual:quick": "playwright test tests/ui-consistency.spec.ts -g 'Full Page'",
    "lint:css": "stylelint 'src/**/*.css'",
    "lint:css:fix": "stylelint 'src/**/*.css' --fix",
    "validate:brand": "node scripts/validate-brand-tokens.js"
  }
}
```

---

## Additional Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Stylelint Documentation](https://stylelint.io/)
- [Tailwind CSS Plugin API](https://tailwindcss.com/docs/plugins)
- [Lab Essentials Brand Guidelines](./BRAND_GUIDELINES.md)

---

## Support

For questions or issues:
1. Check this documentation
2. Review test output and error messages
3. Check existing GitHub issues
4. Create new issue with screenshots and error logs
