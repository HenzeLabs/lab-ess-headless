# GTM Analytics Validation Guide

## 🎯 Quick Validation Checklist

### 1. GTM Container Installation

**Container ID:** `GTM-WNG6Z9ZD`

#### Verify Installation
```javascript
// Open browser console on any page
console.log(window.dataLayer);
console.log(document.querySelector('script[src*="googletagmanager.com/gtm.js"]'));
```

**Expected Results:**
- ✅ `dataLayer` is an array
- ✅ GTM script tag exists
- ✅ Only ONE GTM script tag (no duplicates)

---

### 2. GA4 Configuration

**Measurement ID:** `G-QCSHJ4TDMY` (configured in GTM)

#### Required Events & Parameters

| Event | Required Parameters | Notes |
|-------|-------------------|-------|
| `view_item` | item_id, item_name, price, quantity, currency | Product page views |
| `view_item_list` | items[], currency | Collection/search pages |
| `select_item` | item_id, item_name, currency | Product card clicks |
| `add_to_cart` | item_id, item_name, price, quantity, value, currency | Add to cart |
| `remove_from_cart` | item_id, item_name, price, quantity, value, currency | Remove from cart |
| `begin_checkout` | items[], value, currency | Checkout start |
| `purchase` | transaction_id, value, currency, items[] | Order complete |
| `view_search_results` | search_term | Search results |
| `newsletter_signup` | engagement_type, email | Newsletter form |

#### Validate in Browser Console
```javascript
// View all dataLayer events
window.dataLayer.filter(e => e.event).forEach(e => console.log(e.event, e.ecommerce));

// Check specific event
window.dataLayer.find(e => e.event === 'purchase');
```

---

### 3. Reddit Pixel

**Pixel ID:** `a2_hwuo2umsdjch`

#### Events Configuration

| Code Event | GTM Tag | Trigger | Parameters |
|------------|---------|---------|------------|
| `ViewContent` | - | Auto (via code) | itemCount, value, currency, products |
| `AddToCart` | - | Auto (via code) | itemCount, value, currency, products |
| `Purchase` | Reddit – Purchase Event | TRG – Purchase (Thank You Page) | transactionId, value, currency, itemCount |
| `Lead` | - | Auto (via code) | email |

#### Test Reddit Pixel
```javascript
// Check if Reddit pixel loaded
console.log(window.rdt);

// View Reddit events (after installing our code)
// Mock for testing:
window.__redditCalls = [];
window.rdt = (...args) => window.__redditCalls.push(args);
```

**Important:**
- Reddit base pixel script must be added to GTM
- Purchase event fires BOTH from code AND GTM tag (redundancy)
- Only fires on `/thank_you` page in GTM

---

### 4. Taboola Pixel

**Configuration:** Official Taboola Tag (ID: `a2_hwuo2umsdjch`)

#### Events Tracked

| Event | Parameters | Notes |
|-------|-----------|-------|
| `view_item` | item_id, item_name, price, currency | Product views |
| `add_to_cart` | item_id, quantity, price, currency | Add to cart |
| `purchase` | order_id, revenue, currency | Purchase complete |
| `newsletter_signup` | email | Newsletter signups |

#### Validate Taboola
```javascript
// Check Taboola events
console.log(window._tfa);
```

---

### 5. Microsoft Clarity

**Configuration:** Custom + Official tags

#### Verify Clarity
```javascript
// Check if Clarity loaded
console.log(window.clarity);

// Check for Clarity script
document.querySelector('script[src*="clarity.ms"]');
```

---

## 🧪 Testing Procedures

### Manual Testing Flow

#### Test 1: Product View
1. Navigate to any product page
2. Open DevTools Console
3. Run:
```javascript
window.dataLayer.filter(e => e.event === 'view_item')
```
4. Verify event exists with all parameters

#### Test 2: Add to Cart
1. Add product to cart
2. Check console:
```javascript
window.dataLayer.filter(e => e.event === 'add_to_cart')
```
3. Verify `value`, `currency`, `items[]` present

#### Test 3: Purchase Flow
1. Complete a test purchase
2. On `/thank_you` page, verify:
```javascript
// GA4 Purchase
window.dataLayer.find(e => e.event === 'purchase')

// Reddit Purchase (if pixel loaded)
window.__redditCalls?.filter(c => c[1] === 'Purchase')

// Taboola Purchase
window._tfa.filter(e => e.name === 'purchase')
```

### Network Monitoring

#### Chrome DevTools Network Tab

1. Open DevTools → Network
2. Filter by:
   - `g/collect` - GA4 requests
   - `tr?` - Reddit Pixel
   - `tfa` - Taboola
   - `clarity.ms` - Microsoft Clarity

3. Verify HTTP 200 responses
4. Check request payloads contain correct data

#### Expected Network Requests

**Purchase Event Should Trigger:**
- ✅ 1x GA4 request to `/g/collect?...&en=purchase`
- ✅ 1x Reddit request to `/tr?...`
- ✅ 1x Taboola request
- ✅ Multiple Clarity requests (session recording)

---

## 🔧 GTM Preview Mode Testing

### Setup
1. Go to GTM: https://tagmanager.google.com/
2. Click **Preview** button
3. Enter your site URL
4. Site opens with GTM debugger overlay

### Validation Steps

#### 1. Check Container Load
- Debugger shows: "Container Loaded"
- No errors in "Errors" tab

#### 2. Verify Tags Fire

| User Action | Expected Tags |
|-------------|--------------|
| Page load | GA4 – Config, Microsoft Clarity |
| View product | GA4 – Event - view_item |
| Add to cart | GA4 – Event - add_to_cart |
| Begin checkout | GA4 – Event - begin_checkout |
| Thank you page | GA4 – Event - purchase, Reddit – Purchase Event |

#### 3. Check Variables

Verify these variables populate correctly:
- `DLV – Currency` = "USD"
- `DLV – Value` = order total
- `DLV – Transaction ID` = order ID
- `DLV – Item Name` = product name
- `DLV – Quantity` = item quantity

#### 4. Validate Triggers

| Trigger | Fires On | Status |
|---------|----------|--------|
| All Pages | Every page | ✅ |
| TRG – Purchase (Thank You Page) | Only `/thank_you` | ✅ |
| TRG – view_item | When view_item event fired | ✅ |
| TRG - view_collection | When view_collection event fired | ✅ |

---

## 🚨 Common Issues & Fixes

### Issue: dataLayer Not Defined
**Cause:** GTM script not loaded yet
**Fix:** Check [AnalyticsWrapper.tsx](../src/AnalyticsWrapper.tsx) initializes `dataLayer` before GTM loads

### Issue: Duplicate Events
**Cause:** Multiple GTM containers or event tracking called twice
**Fix:**
```javascript
// Check for duplicate containers
document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]').length
// Should return 1
```

### Issue: Missing Parameters
**Cause:** Event tracked before product data available
**Fix:** Ensure `trackPurchase()` receives complete order data

### Issue: Reddit Pixel Not Firing
**Cause:** Base Reddit script not added to GTM
**Fix:** Add Reddit base code to GTM Custom HTML tag:
```html
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
rdt('init','a2_hwuo2umsdjch', {"optOut":false,"useDecimalCurrencyValues":true});
rdt('track', 'PageVisit');
</script>
```

---

## 📊 Automated Testing

### Run Full Validation Suite
```bash
# Install dependencies
npm install

# Run GTM validation tests
npm run test:gtm

# Or run manually
npx playwright test tests/gtm-validation.spec.ts
```

### Test Coverage

The automated tests validate:
- ✅ GTM container loads once (no duplicates)
- ✅ dataLayer initializes before tags fire
- ✅ All 7 GA4 ecommerce events fire correctly
- ✅ All required parameters present
- ✅ Reddit pixel events fire with correct data
- ✅ Taboola events fire with correct data
- ✅ No `undefined` variables in dataLayer
- ✅ Network requests return HTTP 200
- ✅ Attribution data (currency, value, transaction_id) present

---

## 📈 Success Criteria

### ✅ All Systems Go

- [x] GTM container `GTM-WNG6Z9ZD` loads on every page
- [x] No duplicate GTM containers
- [x] `window.dataLayer` initializes before any tags fire
- [x] GA4 tag fires once per page
- [x] All 7 GA4 ecommerce events fire with required parameters
- [x] Reddit pixel configured (code + GTM tag for Purchase)
- [x] Taboola pixel fires for purchase and add_to_cart
- [x] Microsoft Clarity loads without duplication
- [x] No undefined variables in dataLayer
- [x] All network requests return HTTP 200
- [x] Transaction data includes: currency (USD), value, transaction_id

---

## 🔗 Quick Links

### GTM & Analytics Dashboards
- [GTM Container](https://tagmanager.google.com/#/container/accounts/6133846297/containers/223663862/workspaces/8)
- [GA4 Property](https://analytics.google.com/analytics/web/#/a291625854p401686673/admin)
- [GA4 DebugView](https://analytics.google.com/analytics/web/#/a291625854p401686673/admin/debugview/overview)
- [Reddit Ads Manager](https://ads.reddit.com/)
- [Taboola Dashboard](https://backstage.taboola.com/)

### Documentation
- [Analytics Implementation Guide](./guides/ANALYTICS_INTEGRATION_GUIDE.md)
- [Analytics Testing Guide](../tests/analytics-flow.spec.ts)
- [Code: analytics.ts](../src/lib/analytics.ts)
- [Code: AnalyticsWrapper.tsx](../src/AnalyticsWrapper.tsx)

---

## 📝 Manual Verification Template

Use this for manual testing sessions:

```
Date: _______________
Tester: _______________

[ ] GTM Container Loads
    Container ID visible: GTM-WNG6Z9ZD
    No duplicates

[ ] GA4 Events Fire
    [ ] view_item
    [ ] add_to_cart
    [ ] begin_checkout
    [ ] purchase

[ ] Reddit Pixel
    [ ] Base script loaded
    [ ] ViewContent fires
    [ ] AddToCart fires
    [ ] Purchase fires on /thank_you

[ ] Taboola Pixel
    [ ] add_to_cart fires
    [ ] purchase fires

[ ] Network Requests
    [ ] GA4: /g/collect (200)
    [ ] Reddit: /tr (200)
    [ ] Taboola: 200
    [ ] Clarity: 200

[ ] Purchase Data Complete
    [ ] currency = USD
    [ ] value = order total
    [ ] transaction_id present
    [ ] items array populated

Notes:
_______________________________________
_______________________________________
```

---

## 🎓 Training Resources

### For Developers
- [GA4 Enhanced Ecommerce Guide](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GTM Developer Guide](https://developers.google.com/tag-platform/tag-manager/web)
- [Reddit Pixel Documentation](https://reddit.zendesk.com/hc/en-us/articles/360055413131)

### For Marketers
- [GTM Best Practices](https://www.simoahava.com/analytics/google-tag-manager-best-practices/)
- [GA4 Event Tracking](https://support.google.com/analytics/answer/9322688)
- [Conversion Tracking Setup](https://support.google.com/google-ads/answer/6095821)
