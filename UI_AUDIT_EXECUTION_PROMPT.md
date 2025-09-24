# 🔍 UI/UX AUDIT EXECUTION PROMPT

You are a meticulous UI/UX auditor tasked with performing a comprehensive audit of the Lab Essentials e-commerce website. Your goal is to identify and document every UI/UX issue that could impact user experience, conversion, or accessibility.

## 🎯 YOUR MISSION

Conduct a **surgical precision audit** to:

- Eliminate ALL UI inconsistencies and strange behaviors
- Fix broken, incorrect, or misplaced links
- Ensure components are properly positioned and functional
- Validate all page layouts work perfectly across devices
- Create a flawless, professional user experience

## 📋 AUDIT EXECUTION STEPS

### STEP 1: Setup Your Testing Environment

- [ ] Test on desktop (Chrome, Safari, Firefox)
- [ ] Test on tablet (iPad/Android tablet)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Have accessibility tools ready (screen reader, keyboard-only navigation)
- [ ] Document setup: browser versions, screen sizes, testing tools

### STEP 2: Navigate Through Every Page

Test these pages systematically:

- [ ] Homepage (`/`)
- [ ] All collection pages (`/collections/*`)
- [ ] Individual product pages (`/products/*`)
- [ ] Cart page (`/cart`)
- [ ] Account pages (`/account/*`)
- [ ] Search results (`/search`)
- [ ] 404 error page
- [ ] Any other custom pages

### STEP 3: Complete the Systematic Checklist

For each page, work through ALL sections below:

## 🧭 NAVIGATION & HEADER CHECKLIST

**Test and document:**

- [ ] Logo positioning and sizing on all screen sizes
- [ ] Menu items alignment and spacing
- [ ] Cart icon positioning and item count display
- [ ] Search functionality (icon/modal behavior)
- [ ] Mobile hamburger menu (open/close animation, styling)
- [ ] Account/login links functionality
- [ ] Sticky header behavior on scroll
- [ ] Header glassmorphism/backdrop effects
- [ ] All main menu links work correctly
- [ ] Dropdown menus appear and link properly
- [ ] Mobile menu links are styled and functional
- [ ] Breadcrumbs are present and accurate
- [ ] Footer links all tested and functional

## 🏠 HOMEPAGE CHECKLIST

**Hero Section:**

- [ ] Hero text positioning and readability
- [ ] CTA buttons styling and hover effects
- [ ] Background animations performance
- [ ] Mobile hero scaling and layout
- [ ] Media elements loading correctly

**Content Sections:**

- [ ] Consistent section spacing
- [ ] Animation timing and triggers
- [ ] Skeleton loaders styling and timing
- [ ] No component overflow issues

## 🏪 COLLECTIONS PAGES CHECKLIST

**Product Grid:**

- [ ] Grid layout spacing on all screen sizes
- [ ] Product card height consistency
- [ ] Product image loading and placeholders
- [ ] Price formatting consistency
- [ ] Product title truncation handling
- [ ] Hover effects smoothness

**Filtering & Sorting:**

- [ ] Filter UI positioning and accessibility
- [ ] Sort dropdown styling consistency
- [ ] Active filter visual indicators
- [ ] Filter clearing functionality
- [ ] Mobile filter behavior

**Pagination:**

- [ ] Pagination controls styling
- [ ] Page number alignment
- [ ] Load more behavior (if applicable)

## 🛒 PRODUCT PAGES CHECKLIST

**Product Details:**

- [ ] Image gallery behavior (main + thumbnails)
- [ ] Image zoom functionality
- [ ] Product title formatting
- [ ] Price display accuracy
- [ ] Variant selection UI
- [ ] Add to cart button prominence
- [ ] Quantity selector functionality
- [ ] Product description formatting

**Layout:**

- [ ] Mobile layout stacking
- [ ] Related products section
- [ ] Product reviews integration
- [ ] Social sharing buttons
- [ ] Back to collection navigation

## 🛍️ CART & CHECKOUT CHECKLIST

**Cart Page:**

- [ ] Cart item display accuracy
- [ ] Quantity controls functionality
- [ ] Remove item confirmation
- [ ] Cart totals calculation
- [ ] Empty cart state messaging
- [ ] Cart update animations

**Checkout Flow:**

- [ ] Checkout button visibility
- [ ] Form field styling consistency
- [ ] Form validation and error states
- [ ] Payment integration (if implemented)
- [ ] Order confirmation messaging

## 📱 MOBILE RESPONSIVENESS CHECKLIST

**Mobile Navigation:**

- [ ] Hamburger menu behavior
- [ ] Touch target sizes (minimum 44px)
- [ ] Mobile search interface
- [ ] Mobile cart functionality

**Mobile Layout:**

- [ ] Text readability and font sizes
- [ ] Button sizing for touch
- [ ] Image scaling without distortion
- [ ] Form input accessibility
- [ ] Smooth scrolling behavior

## ♿ ACCESSIBILITY CHECKLIST

**Keyboard Navigation:**

- [ ] Logical tab order through all elements
- [ ] Visible focus indicators
- [ ] Skip to main content link
- [ ] Keyboard accessible dropdowns

**Screen Reader Support:**

- [ ] Descriptive alt text for all images
- [ ] Proper ARIA labels on interactive elements
- [ ] Logical heading hierarchy (h1→h2→h3)
- [ ] Proper form labels
- [ ] Error announcements for screen readers

## 🎨 VISUAL CONSISTENCY CHECKLIST

**Typography:**

- [ ] Font consistency throughout site
- [ ] Heading hierarchy consistency
- [ ] Line spacing consistency
- [ ] Text color contrast compliance (WCAG)

**Color & Branding:**

- [ ] Brand color consistency
- [ ] Button color variants consistency
- [ ] Link color consistency
- [ ] Error/success state colors

**Spacing & Layout:**

- [ ] Consistent section margins
- [ ] Internal padding consistency
- [ ] Grid alignment accuracy
- [ ] Appropriate white space usage

## ⚡ PERFORMANCE & LOADING CHECKLIST

**Loading States:**

- [ ] Progressive image loading
- [ ] Skeleton screens implementation
- [ ] Loading indicators for async actions
- [ ] Error state handling

**Animation Performance:**

- [ ] Smooth animations (no jank)
- [ ] Reduced motion preferences respected
- [ ] Appropriate animation delays

## 🔗 LINK VALIDATION CHECKLIST

**Test Every Link:**

- [ ] All internal links navigate correctly
- [ ] External links open in new tab with proper rel attributes
- [ ] Email links (mailto:) functionality
- [ ] Phone links (tel:) on mobile
- [ ] Social media links accuracy

**Content Quality:**

- [ ] No spelling or grammatical errors
- [ ] No placeholder text in production
- [ ] High-quality, optimized images
- [ ] Logical content hierarchy

## 🚨 ERROR HANDLING & EDGE CASES CHECKLIST

**Error Pages:**

- [ ] Custom 404 page with site navigation
- [ ] Server error page consistency
- [ ] Network error handling

**Edge Cases:**

- [ ] Empty search results messaging
- [ ] Out of stock product handling
- [ ] Long product name truncation
- [ ] Many product variants usability
- [ ] Large cart quantity handling

## 📝 DOCUMENTATION REQUIREMENTS

For each issue found, document:

```
PAGE: _______________
DEVICE: _______________
BROWSER: _______________
ISSUE: _______________
PRIORITY: 🔴 Critical / 🟡 Important / 🟢 Nice-to-have
SCREENSHOT: [Attach if visual issue]
STEPS TO REPRODUCE: _______________
EXPECTED BEHAVIOR: _______________
ACTUAL BEHAVIOR: _______________
FIX APPLIED: _______________
STATUS: ✅ Fixed / 🔄 In Progress / ❌ Not Fixed
```

## 🎯 SUCCESS CRITERIA

**The audit is complete when:**

- ✅ Every checkbox above is completed and documented
- ✅ All critical and important issues are fixed
- ✅ The site works flawlessly on all tested devices/browsers
- ✅ All links navigate to correct destinations
- ✅ The user experience feels professional and polished
- ✅ Accessibility requirements are met
- ✅ Performance is optimized with proper loading states

## 🏁 FINAL DELIVERABLE

Create a comprehensive audit report including:

1. **Executive Summary** - Overall findings and priorities
2. **Issue List** - All documented issues with fixes
3. **Before/After Screenshots** - Visual proof of improvements
4. **Testing Evidence** - Device/browser compatibility confirmation
5. **Accessibility Report** - WCAG compliance verification
6. **Performance Metrics** - Loading times and Core Web Vitals

**Remember:** No detail is too small. Every pixel matters for creating an exceptional e-commerce experience that converts visitors into customers!
