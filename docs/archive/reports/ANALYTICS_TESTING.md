# Analytics Testing & Monitoring Guide

Comprehensive guide for testing and monitoring your Lab Essentials analytics implementation.

## Table of Contents

- [Quick Health Check](#quick-health-check)
- [Client-Side Testing](#client-side-testing)
- [Server-Side Testing](#server-side-testing)
- [GA4 Verification](#ga4-verification)
- [Cross-Domain Tracking Test](#cross-domain-tracking-test)
- [Monitoring Dashboard](#monitoring-dashboard)
- [Common Issues](#common-issues)

---

## Quick Health Check

### 1. Verify Environment Variables (Production)

If deployed to **Vercel**:
```bash
vercel env ls
```

Should show:
- ✅ `GA4_MEASUREMENT_PROTOCOL_SECRET`
- ✅ `SHOPIFY_WEBHOOK_SECRET`
- ✅ `TABOOLA_ADVERTISER_ID`

If any are missing, add them:
```bash
vercel env add GA4_MEASUREMENT_PROTOCOL_SECRET
# Paste your secret when prompted
# Select "Production" environment
```

---

### 2. Check Webhook Status

**Shopify Admin → Settings → Notifications → Webhooks**

Your webhook should show:
```
✅ Order creation
   URL: https://labessentials.com/api/webhooks/shopify/orders
   Format: JSON
   Status: Active
   Last delivery: [recent timestamp]
```

**Test the webhook**:
1. Click on the webhook
2. Click "Send test notification"
3. Check "Recent deliveries" tab
4. Should show HTTP 200 response

---

### 3. Verify Analytics Scripts Load

Open your site in browser:
```
https://labessentials.com
```

**Chrome DevTools → Network tab**:
- ✅ `gtm.js?id=GTM-WNG6Z9ZD` - GTM loaded
- ✅ `gtag/js?id=G-QCSHJ4TDMY` - GA4 loaded
- ✅ `fbevents.js` - Meta Pixel loaded
- ✅ `tfa.js` - Taboola loaded

**Console tab** (should be clean):
- ❌ No "Failed to load resource" errors
- ❌ No analytics initialization errors

---

## Client-Side Testing

### Test 1: GTM Preview Mode

**Setup**:
1. Open [Google Tag Manager](https://tagmanager.google.com/)
2. Select container `GTM-WNG6Z9ZD`
3. Click "Preview" button
4. Enter your site URL: `https://labessentials.com`
5. Connect

**Test Flow**:
```
Home → Collection → Product → Add to Cart → Cart → Checkout
```

**Verify Tags Fire**:

| Page | Expected Tags | dataLayer Events |
|------|---------------|------------------|
| Home | Page View, GTM Init | `gtm.js`, `gtm.load` |
| Collection | Page View, view_item_list | `view_item_list` |
| Product | Page View, view_item | `view_item` |
| Add to Cart | add_to_cart | `add_to_cart` |
| Cart | Page View, view_cart | `view_cart` |
| Click Checkout | begin_checkout | `begin_checkout` |

**How to verify**:
- GTM Preview → Variables tab
- Check "Data Layer Variables"
- Expand `ecommerce` object
- Verify structure matches:
  ```javascript
  {
    event: "add_to_cart",
    ecommerce: {
      currency: "USD",
      value: 99.99,
      items: [{
        item_id: "product-handle",
        item_name: "Product Name",
        price: 99.99,
        quantity: 1
      }]
    }
  }
  ```

---

### Test 2: GA4 DebugView

**Enable Debug Mode**:

Option A - Chrome Extension:
1. Install "Google Analytics Debugger" extension
2. Enable it (icon turns green)
3. Reload your site

Option B - URL Parameter:
```
https://labessentials.com?debug_mode=1
```

**Open DebugView**:
1. [Google Analytics](https://analytics.google.com/)
2. Configure → DebugView
3. You should see your session appear

**Test Full Journey**:
```
1. Land on homepage
   ✅ Verify: page_view event

2. Click on product
   ✅ Verify: view_item event with product details

3. Add to cart
   ✅ Verify: add_to_cart event with value & items

4. Go to cart
   ✅ Verify: view_cart event

5. Click checkout
   ✅ Verify: begin_checkout event
   ✅ Verify: Redirects to checkout.shopify.com with _gl parameter
```

**Check Event Parameters**:
Click on each event in DebugView:
- ✅ `currency`: "USD"
- ✅ `value`: numeric (e.g., 99.99)
- ✅ `items`: array with item_id, item_name, price, quantity
- ✅ `session_id`: consistent across all events
- ✅ `engagement_time_msec`: present

---

### Test 3: Meta Pixel Helper

**Install Extension**:
1. [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Open your site
3. Click extension icon

**Expected Events**:

| Action | Event Name | Parameters |
|--------|------------|------------|
| Page Load | PageView | - |
| View Product | ViewContent | content_type: "product", content_ids, value |
| Add to Cart | AddToCart | content_type: "product", content_ids, value, currency |
| Purchase* | Purchase | value, currency, content_ids |

*Purchase only fires after Shopify checkout completion

**Verify in Pixel Helper**:
- ✅ Events show in green (successful)
- ✅ No warnings or errors
- ✅ Parameters populated correctly

---

### Test 4: Cross-Domain Tracking

**Critical Test**: Verify session continuity to Shopify checkout

**Steps**:
1. Open Chrome DevTools → Network tab
2. Add product to cart
3. Go to cart page
4. Click "Checkout" button
5. **Before redirect completes**: Look at Network tab

**Verify `_gl` Parameter**:
```
https://checkout.shopify.com/...?_gl=1*abc123*_ga*MTIzNDU2Nzg5MA..
```

The `_gl` parameter contains:
- GA4 client_id
- Session information
- Timestamp

**Check GA4 Real-Time**:
1. Keep GA4 Real-Time open in another tab
2. Watch as you go through checkout
3. Verify user stays as "1 active user" (no new session)

**Session Break Indicators** (should NOT see):
- ❌ New `session_start` event on Shopify domain
- ❌ Different `session_id` in events
- ❌ User count jumps to "2 active users"

---

## Server-Side Testing

### Test 1: Webhook Endpoint Response

**Manual Test**:
```bash
curl -X POST https://labessentials.com/api/webhooks/shopify/orders \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: invalid" \
  -d '{
    "id": 123456789,
    "order_number": 1001,
    "total_price": "99.99",
    "currency": "USD",
    "line_items": []
  }'
```

**Expected Response**:
```json
{"error": "Invalid signature"}
```

This confirms:
- ✅ Endpoint is reachable
- ✅ HMAC validation is working
- ✅ Security is functioning

---

### Test 2: Shopify Test Webhook

**Send from Shopify**:
1. Shopify Admin → Settings → Notifications
2. Click on your webhook
3. Click "Send test notification"

**Check Server Logs**:

If on **Vercel**:
```bash
vercel logs https://labessentials.com
```

**Expected logs**:
```
Received Shopify order webhook: {
  orderId: 123456789,
  orderNumber: 1001,
  total: '99.99',
  currency: 'USD',
  itemCount: 1
}
✅ Taboola S2S purchase tracked: 1001
Successfully sent purchase event to GA4: 1001
```

**Check Recent Deliveries**:
- Status: `200 OK`
- Response body: `{"success":true,"orderId":1001}`

---

### Test 3: GA4 Measurement Protocol

**Verify Purchase Event in GA4**:

After test webhook:
1. GA4 → Reports → Real-time
2. Look for `purchase` event
3. Event should show:
   - ✅ `transaction_id`: Order number
   - ✅ `value`: Total price
   - ✅ `currency`: USD
   - ✅ `items`: Array of products

**Check in DebugView**:
1. Enable debug: Send webhook with `debug_mode=true` parameter
2. GA4 → DebugView
3. Look for server-generated `purchase` event
4. Should show different `client_id` than browser events

---

### Test 4: Taboola S2S Conversion

**Check Taboola Dashboard**:
1. Log into Taboola Ads Manager
2. Reports → Conversions
3. Filter by last 24 hours
4. Look for test purchase conversion

**Verify in Logs**:
```
✅ Taboola S2S purchase tracked: [order_number]
```

**Debug if not showing**:
- Check `TABOOLA_ADVERTISER_ID` is correct
- Verify Pixel ID (1759164) matches your account
- Check API endpoint: `https://trc.taboola.com/actions-handler/log/3/s2s-action`

---

## GA4 Verification

### Real Purchase Test

**Complete a Test Order**:
1. Use Shopify's test card: `4242 4242 4242 4242`
2. Go through complete checkout
3. Complete purchase

**Verify Client-Side Events** (Real-Time):
```
1. begin_checkout - Fired when clicking "Checkout" button
2. [Redirect to Shopify]
3. [User completes checkout]
4. [Shopify processes order]
```

**Verify Server-Side Event** (Within 1 minute):
```
5. purchase - Fired from webhook after order created
```

**Both should have**:
- Same `transaction_id` (order number)
- Same `value` (total amount)
- Same `items` (products purchased)

---

### Attribution Verification

**Test Source/Medium Retention**:

1. Visit your site with UTM parameters:
   ```
   https://labessentials.com?utm_source=test&utm_medium=audit&utm_campaign=analytics_test
   ```

2. Complete purchase flow

3. Check GA4 after 24-48 hours:
   - Reports → Acquisition → Traffic acquisition
   - Find your test transaction
   - Should show: `test / audit` (not `(direct) / (none)`)

**Cross-Domain Test**:
1. Start on your site
2. Note the source/medium in GA4 Real-Time
3. Go through checkout on Shopify
4. Complete purchase
5. Verify same source/medium attributed to purchase

---

## Monitoring Dashboard

### Daily Checks

**GA4 Real-Time (Check multiple times per day)**:
- [ ] Active users count looks normal
- [ ] Events firing (page_view, view_item, add_to_cart)
- [ ] No error events
- [ ] Purchase events appearing

**GA4 Reports (Check daily)**:
1. Reports → Real-time → Event count by Event name
   - `page_view`: Should be highest
   - `view_item`: ~10-20% of page_view
   - `add_to_cart`: ~2-5% of view_item
   - `begin_checkout`: ~50-70% of add_to_cart
   - `purchase`: ~20-40% of begin_checkout

2. Reports → Ecommerce → Ecommerce purchases
   - Revenue trend
   - Transaction count
   - Average order value

---

### Weekly Checks

**Attribution Analysis**:
- Reports → Acquisition → Traffic acquisition
- Check "(direct)" percentage
  - **Before linker fix**: Likely 30-50% of purchases
  - **After linker fix**: Should be <10% of purchases
  - **If still high**: Cross-domain tracking may have issues

**Conversion Paths**:
- Reports → Advertising → Attribution → Conversion paths
- Verify complete paths: `landing → view_item → add_to_cart → purchase`
- Look for session breaks (multiple `session_start` events)

**Meta Pixel Events**:
- Meta Events Manager → Data Sources → Your Pixel
- Check event counts for last 7 days:
  - PageView, ViewContent, AddToCart, Purchase
- Verify Purchase events match GA4 ±5%

**Taboola Conversions**:
- Taboola Ads Manager → Reports → Conversions
- Verify conversion tracking working
- Check conversion value matches GA4

---

### Monthly Checks

**Data Quality Audit**:
```bash
# Run verification script
npm run verify:env
```

**Server-Side vs Client-Side**:
- Compare GA4 purchase events from:
  - Browser (via gtag)
  - Server (via Measurement Protocol)
- Ratio should be ~1:1 (both fire for same order)
- If server-side much lower:
  - Check webhook delivery rate
  - Verify `GA4_MEASUREMENT_PROTOCOL_SECRET`

**Webhook Delivery Health**:
- Shopify → Settings → Notifications → Webhooks
- Check webhook → "Recent deliveries"
- Success rate should be >99%
- If failures:
  - Check error messages
  - Verify endpoint URL
  - Check server logs

---

## Common Issues

### Issue 1: No Events in GA4 DebugView

**Symptoms**:
- DebugView shows no events
- Real-Time reports working fine

**Causes**:
- Debug mode not enabled
- Ad blocker blocking debugger

**Fix**:
1. Disable ad blockers
2. Use Chrome Incognito mode
3. Install "Google Analytics Debugger" extension
4. Hard refresh page (Cmd+Shift+R or Ctrl+Shift+R)

---

### Issue 2: Session Breaks at Checkout

**Symptoms**:
- New `session_start` on checkout.shopify.com
- Purchases attributed to "(direct)"
- User count jumps in Real-Time

**Causes**:
- GA4 linker not configured (now fixed)
- Cookie blocked by browser
- Safari ITP

**Fix**:
1. Verify linker in AnalyticsWrapper.tsx (✅ Already done)
2. Check `_gl` parameter in URL
3. Test in Chrome (best compatibility)
4. For Safari: Server-side tracking provides backup

---

### Issue 3: Webhook Failures

**Symptoms**:
- "Recent deliveries" shows errors
- No server-side purchase events in GA4
- Error logs in Vercel

**Common Errors**:

**401 Unauthorized**:
- Wrong `SHOPIFY_WEBHOOK_SECRET`
- Fix: Update environment variable with correct secret

**500 Internal Server Error**:
- Missing `GA4_MEASUREMENT_PROTOCOL_SECRET` or `TABOOLA_ADVERTISER_ID`
- Fix: Add missing environment variables

**Timeout**:
- GA4/Taboola API slow or down
- Usually self-resolves, webhook will retry

---

### Issue 4: dataLayer Not Populating

**Symptoms**:
- GTM Preview shows empty dataLayer
- Events not firing

**Debug**:
```javascript
// In browser console
console.log(window.dataLayer);

// Should show array like:
[
  {gtm.start: 1234567890, event: "gtm.js"},
  {event: "gtm.load"},
  {ecommerce: null},
  {event: "view_item", ecommerce: {...}}
]
```

**Fix**:
1. Check for JavaScript errors in Console
2. Verify AnalyticsWrapper is mounted
3. Check network tab - GTM loaded?
4. Clear cache and hard refresh

---

### Issue 5: Meta Pixel Helper Shows Warnings

**Common Warnings**:

**"No Match Between Pixel and Catalog"**:
- Not critical for tracking
- Means product IDs don't match Facebook catalog
- Fix: Only if running Facebook Dynamic Ads

**"Encoded Characters"**:
- Non-Latin characters in product names
- Usually not an issue
- Tracking still works

**"Multiple Pixels Found"**:
- Another pixel installed (old code?)
- Check for duplicate `fbq('init')` calls
- Remove old implementation

---

## Testing Checklist

### Pre-Launch Checklist
- [ ] All environment variables set (run `npm run verify:env`)
- [ ] GTM Preview mode - all tags fire
- [ ] GA4 DebugView - all events appear with correct parameters
- [ ] Meta Pixel Helper - no errors
- [ ] Cross-domain tracking - `_gl` parameter present
- [ ] Webhook endpoint - responds to test
- [ ] Shopify webhook - test notification succeeds
- [ ] Test purchase - completes successfully
- [ ] Purchase event - appears in GA4 Real-Time

### Post-Launch Monitoring (First Week)
- [ ] Day 1: Check GA4 Real-Time every 2 hours
- [ ] Day 1: Verify first real purchase tracked
- [ ] Day 2: Check webhook delivery success rate
- [ ] Day 3: Verify attribution data looks correct
- [ ] Day 7: Compare server-side vs client-side purchases
- [ ] Day 7: Check "(direct)" percentage decreased

### Ongoing Monitoring
- [ ] Daily: GA4 Real-Time for anomalies
- [ ] Daily: Check for console errors on site
- [ ] Weekly: Attribution reports
- [ ] Weekly: Webhook delivery health
- [ ] Monthly: Full data quality audit
- [ ] Monthly: Compare across platforms (GA4, Meta, Taboola)

---

## Analytics Health Score

### How to Calculate

**100 points total**:

1. **Critical Events (40 points)**
   - page_view: 10 points
   - view_item: 10 points
   - add_to_cart: 10 points
   - purchase: 10 points

2. **Data Quality (30 points)**
   - Currency always USD: 10 points
   - Item IDs consistent: 10 points
   - Values are numeric: 10 points

3. **Cross-Domain (20 points)**
   - Session continuity: 10 points
   - Attribution preserved: 10 points

4. **Server-Side (10 points)**
   - Webhook success rate >95%: 5 points
   - Server-side matches client-side: 5 points

**Scoring**:
- 90-100: ✅ Excellent
- 70-89: ⚠️ Good (minor issues)
- 50-69: ❌ Needs attention
- <50: 🚨 Critical issues

---

## Support & Resources

- **GA4 Documentation**: https://support.google.com/analytics/answer/9267735
- **GTM Help**: https://support.google.com/tagmanager
- **Shopify Webhooks**: https://shopify.dev/docs/api/webhooks
- **Meta Events**: https://developers.facebook.com/docs/meta-pixel
- **Taboola Tracking**: https://help.taboola.com/hc/en-us

**Project Documentation**:
- [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) - Environment variables
- [AnalyticsWrapper.tsx](src/AnalyticsWrapper.tsx) - Client-side tracking
- [analytics.ts](src/lib/analytics.ts) - Event tracking functions
- [webhooks/shopify/orders/route.ts](src/app/api/webhooks/shopify/orders/route.ts) - Server-side tracking

---

**Last Updated**: 2025-01-20
**Version**: 1.0.0
