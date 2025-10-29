# Agent Validation Prompt - Post-Reddit Base Pixel Deployment

**Date:** 2025-10-27
**Prerequisite:** Reddit base pixel script must be added to GTM before running this validation

---

## 🎯 Objective

Validate the complete analytics stack on **store.labessentials.com** (production) after the Reddit base pixel has been added to GTM. Confirm all tags fire correctly, dataLayer integrity is maintained, network requests succeed, and identify any additional configuration needed.

---

## 📋 Prerequisites

Before starting this validation, confirm:

1. ✅ **Production Analytics Validation Report reviewed**
   - Location: `/docs/PRODUCTION_ANALYTICS_VALIDATION_REPORT.md`
   - All code validation passed (21/21 checks)

2. ✅ **Reddit Base Pixel added to GTM**
   - Container: GTM-WNG6Z9ZD
   - Tag name: "Reddit – Base Pixel"
   - Tag type: Custom HTML
   - Trigger: All Pages
   - Status: Published

3. ✅ **GTM Container published**
   - Version: v1.4 or later
   - Changes: Reddit base pixel script added
   - Published to: Production

---

## 🔍 Validation Tasks

### Task 1: Confirm Reddit Base Pixel in GTM

**Steps:**
1. Log into Google Tag Manager: https://tagmanager.google.com/
2. Select container: **GTM-WNG6Z9ZD**
3. Navigate to: Tags
4. Search for: "Reddit – Base Pixel"

**Verify:**
- [ ] Tag exists and is enabled
- [ ] Tag type: Custom HTML
- [ ] Trigger: All Pages
- [ ] Script contains: `rdt('init','a2_hwuo2umsdjch'`
- [ ] Script contains: `rdt('track','PageVisit')`
- [ ] Tag is published (not draft)

**Screenshot:** Save screenshot of tag configuration

---

### Task 2: GTM Preview Mode Validation

**Steps:**
1. In GTM, click **"Preview"** button
2. Enter production URL: **https://labessentials.com** or **https://store.labessentials.com**
3. GTM Preview debugger should appear in new tab

#### 2A. Verify Page Load Tags

**Navigate to:** Any page (homepage recommended)

**Expected Tags to Fire:**

| Tag Name | Status | Notes |
|----------|--------|-------|
| GA4 – Config | Should fire | Green in debugger |
| **Reddit – Base Pixel** | **Should fire** | **Verify this is green** |
| Taboola – Official | Should fire | Green in debugger |
| Microsoft Clarity – Custom | Should fire | Green in debugger |
| Microsoft Clarity – Official | Should fire | Green in debugger |

**Verify:**
- [ ] Reddit – Base Pixel fires on page load
- [ ] Tag shows as "Tags Fired" (not "Tags Not Fired")
- [ ] No errors in debugger

**Screenshot:** GTM Preview showing Reddit – Base Pixel in "Tags Fired"

#### 2B. Verify Product Page Tags

**Navigate to:** Any product page (e.g., /products/some-product)

**Expected Tags:**

| Tag Name | Status |
|----------|--------|
| All page load tags | Should fire |
| GA4 – Event - view_item | Should fire |

**DataLayer Check:**
```javascript
// In GTM Preview, check dataLayer
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    items: [{ item_id, item_name, price, quantity }]
  }
}
```

**Verify:**
- [ ] view_item event in dataLayer
- [ ] All required parameters present
- [ ] GA4 tag fires on view_item event

#### 2C. Verify Thank You Page Tags

**Navigate to:** `/thank_you` page (requires completing a purchase or navigating directly)

**Expected Tags:**

| Tag Name | Status | Priority |
|----------|--------|----------|
| GA4 – Event - purchase | Should fire | High |
| **Reddit – Purchase Event** | **Should fire** | **High** |
| Taboola conversion | Should fire | Medium |

**DataLayer Check:**
```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ORDER-123',
    value: 299.99,
    currency: 'USD',
    items: [...]
  }
}
```

**Verify:**
- [ ] Purchase event in dataLayer
- [ ] transaction_id present
- [ ] value and currency correct
- [ ] Reddit – Purchase Event fires
- [ ] GA4 purchase event fires

**Screenshot:** GTM Preview on /thank_you showing both Reddit tags fired

---

### Task 3: Browser Console Validation

**Open production site:** https://labessentials.com

**Open Chrome DevTools Console**

#### 3A. Verify Pixel Functions Loaded

```javascript
// 1. Reddit Pixel (should now be defined)
window.rdt
// Expected: ƒ () { ... }
// Previous: undefined
// Status: ___________

// 2. Taboola
window._tfa
// Expected: Array
// Status: ___________

// 3. Clarity
window.clarity
// Expected: function or object
// Status: ___________

// 4. DataLayer
window.dataLayer
// Expected: Array with events
// Status: ___________

// 5. Analytics Functions
window.__labAnalytics
// Expected: { trackViewItem: ƒ, trackAddToCart: ƒ, ... }
// Status: ___________
```

**Record Results:**
- [ ] `window.rdt` is now a function (not undefined)
- [ ] `window._tfa` is an array
- [ ] `window.clarity` is defined
- [ ] `window.dataLayer` contains events
- [ ] `window.__labAnalytics` has tracking functions

#### 3B. Test Reddit Event Manually

```javascript
// Fire a manual Reddit ViewContent event
if (window.rdt) {
  window.rdt('track', 'ViewContent', {
    itemCount: 1,
    value: 99.99,
    currency: 'USD',
    products: [{ id: 'test-001', name: 'Test Product' }]
  });
  console.log('✅ Reddit ViewContent event fired manually');
} else {
  console.error('❌ window.rdt is not defined');
}
```

**Verify:**
- [ ] No console errors
- [ ] Reddit event fires successfully

---

### Task 4: Network Request Validation

**Open Chrome DevTools → Network tab**

**Apply filters:**
1. `collect` - for GA4
2. `reddit` or `tr` - for Reddit Pixel
3. `tfa` - for Taboola
4. `clarity.ms` - for Microsoft Clarity

#### 4A. Page Load Network Requests

**Clear network log, then refresh page**

**Expected Network Requests:**

| Platform | URL Pattern | Status | Priority |
|----------|-------------|--------|----------|
| GA4 | `/g/collect?...` | 200 | High |
| **Reddit** | **`/tr?...` or reddit endpoint** | **200** | **High** |
| Taboola | Taboola endpoint | 200 | Medium |
| Clarity | `clarity.ms/*` | 200 | Medium |

**Verify:**
- [ ] Reddit pixel requests appear in Network tab
- [ ] All requests return HTTP 200
- [ ] Reddit requests contain pixel ID `a2_hwuo2umsdjch`

**Screenshot:** Network tab showing Reddit pixel requests with HTTP 200

#### 4B. Purchase Flow Network Validation

**Complete a test purchase or navigate to /thank_you**

**Additional Expected Requests:**

| Platform | Event | URL Contains | Status |
|----------|-------|--------------|--------|
| GA4 | purchase | `en=purchase` | 200 |
| Reddit | Purchase | Reddit endpoint | 200 |
| Taboola | conversion | Taboola endpoint | 200 |

**Verify:**
- [ ] Reddit Purchase request fires
- [ ] Request contains transaction data
- [ ] HTTP 200 response

---

### Task 5: Run Automated Validation

**From project root, run:**

```bash
npm run audit:gtm
```

**Expected Output:**
```
✅ Passed: 21
❌ Failed: 0
⚠️  Warnings: 0

🎉 All checks passed!
```

**Verify:**
- [ ] 21/21 checks still pass
- [ ] No new errors or warnings
- [ ] Script completes successfully

**If any checks fail:**
- Document which check failed
- Note the error message
- Include in findings report

---

### Task 6: Platform Dashboard Verification

#### 6A. GA4 DebugView

**URL:** https://analytics.google.com/analytics/web/#/a291625854p401686673/admin/debugview/overview

**Steps:**
1. Open GA4 DebugView
2. In another tab, navigate production site
3. Perform actions (view product, add to cart, etc.)

**Verify:**
- [ ] Events appear in real-time
- [ ] view_item events show
- [ ] add_to_cart events show
- [ ] purchase events show (if tested)
- [ ] All events have required parameters

**Screenshot:** GA4 DebugView showing real-time events

#### 6B. Reddit Ads Manager

**URL:** https://ads.reddit.com/ → Pixels & Conversions

**Steps:**
1. Navigate to Reddit Ads Manager
2. Go to Pixels & Conversions section
3. Select pixel: `a2_hwuo2umsdjch`
4. Check recent events

**Verify:**
- [ ] PageVisit events tracking
- [ ] ViewContent events appear (if product page visited)
- [ ] AddToCart events appear (if tested)
- [ ] Purchase events appear (if tested)
- [ ] Event count increasing
- [ ] Transaction data includes value, currency, transaction ID

**Screenshot:** Reddit Ads Manager showing recent pixel events

#### 6C. Taboola Dashboard

**URL:** https://backstage.taboola.com/ → Conversions

**Verify:**
- [ ] Conversion tracking active
- [ ] Recent conversions appear

---

### Task 7: Check for New Requirements

#### 7A. Review Recent Code Changes

**Check commits since last deployment:**

```bash
git log --oneline -10
```

**Review:**
- [ ] Search page improvements deployed
- [ ] GTM analytics validation deployed
- [ ] Any new event schemas introduced
- [ ] Any renamed parameters
- [ ] Any updated frontend components

**Document:**
- New events that need GTM tags: ___________
- Parameter changes required: ___________
- Component updates affecting analytics: ___________

#### 7B. Check for Undefined Variables

**In GTM Preview mode, check Variables tab**

**Look for:**
- [ ] Any variables showing "undefined"
- [ ] Missing dataLayer variable mappings
- [ ] Incorrect variable references

**Document any issues found**

#### 7C. Verify Debug Console

**URL:** https://labessentials.com/gtm-debug.html

**Verify:**
- [ ] Debug console loads
- [ ] Platform status indicators show green
- [ ] Reddit status now shows green (was yellow/warning)
- [ ] Test buttons fire events
- [ ] Event log displays correctly

**Screenshot:** Debug console showing all platforms green

---

## 📊 Deliverable: Post-Reddit Validation Report

Create file: `/reports/POST_REDDIT_VALIDATION_REPORT.md`

### Required Sections:

#### 1. Executive Summary
- Overall validation status (Pass/Fail)
- Reddit pixel status
- Any critical issues found

#### 2. GTM Tag Verification
- List of all tags checked
- Tag firing status
- Screenshots from GTM Preview

#### 3. Browser Console Results
- All `window.*` checks
- Any errors or warnings
- Console screenshots

#### 4. Network Request Analysis
- HTTP status codes
- Request/response examples
- Network tab screenshots

#### 5. Platform Dashboard Verification
- GA4 DebugView results
- Reddit Ads Manager results
- Taboola results
- Screenshots from each platform

#### 6. Automated Validation Results
- `npm run audit:gtm` output
- Any failures or warnings

#### 7. New Requirements Identified
- Missing GTM tags
- Undefined variables
- Parameter mapping issues
- Recommended updates

#### 8. Recommendations
- Immediate actions required
- Nice-to-have improvements
- Monitoring suggestions

#### 9. Sign-Off
- Validation date/time
- Performed by
- Overall status (Ready for Production / Issues Found)

---

## ✅ Success Criteria

**Validation is complete when:**

- [ ] Reddit base pixel confirmed in GTM
- [ ] Reddit – Base Pixel fires on all pages
- [ ] Reddit – Purchase Event fires on /thank_you
- [ ] `window.rdt` is a function (not undefined)
- [ ] Reddit network requests return HTTP 200
- [ ] Events appear in Reddit Ads Manager
- [ ] 21/21 automated checks pass
- [ ] GA4 events still working correctly
- [ ] No new undefined variables in GTM
- [ ] Debug console shows all platforms green
- [ ] Report documented in `/reports/POST_REDDIT_VALIDATION_REPORT.md`

---

## 🚨 If Issues Found

### Critical Issues (Stop and Fix)
- Reddit pixel not firing
- GTM container errors
- dataLayer corruption
- HTTP errors (4xx, 5xx)

### Non-Critical Issues (Document and Continue)
- Minor timing issues
- Optional parameters missing
- UI inconsistencies in debug tools

**All issues must be documented in the final report.**

---

## 📖 Reference Documentation

- [Production Analytics Validation Report](../docs/PRODUCTION_ANALYTICS_VALIDATION_REPORT.md)
- [GTM Validation Guide](../docs/GTM_VALIDATION_GUIDE.md)
- [GTM Audit Summary](../docs/GTM_AUDIT_SUMMARY.md)
- [Search Improvements Deployment](../docs/SEARCH_IMPROVEMENTS_DEPLOYMENT.md)

---

## 🎯 Agent Instructions

1. **Read** the Production Analytics Validation Report first
2. **Confirm** Reddit base pixel has been added to GTM
3. **Follow** each task sequentially
4. **Document** findings with screenshots
5. **Create** the Post-Reddit Validation Report
6. **Commit** the report to `/reports/`
7. **Notify** stakeholders of validation results

**Estimated Time:** 30-45 minutes

**Priority:** High (blocks full production readiness)

---

**Prompt Version:** 1.0
**Created:** 2025-10-27
**Last Updated:** 2025-10-27
**Status:** Ready for Agent Execution
