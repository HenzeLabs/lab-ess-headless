# GA4 Configuration Alignment Guide

**Date:** 2025-10-29
**Current GA4 Measurement ID:** G-7NR2JG1EDP
**GTM Container ID:** GTM-WNG6Z9ZD

---

## 🎯 Overview

This guide ensures all analytics tracking aligns with the correct GA4 measurement ID: **G-7NR2JG1EDP**

## ✅ Current Implementation Status

### Code-Level Configuration
- ✅ **GTM Container**: Loaded inline in `src/app/layout.tsx` with ID `GTM-WNG6Z9ZD`
- ✅ **DataLayer**: Initialized in `src/AnalyticsWrapper.tsx` before GTM loads
- ✅ **Consent Mode V2**: Configured with auto-grant on user interaction
- ✅ **Analytics Helpers**: Lazy-loaded via `src/lib/analytics.ts`
- ✅ **SPA Page Views**: Handled by AnalyticsWrapper on route changes

### GTM Container Configuration (Manual Steps Required)

The following steps must be completed in the Google Tag Manager interface:

---

## 📋 Step-by-Step Verification & Setup

### Step 1: Update GTM Container GA4 Config Tag

**In GTM (gtm=WNG6Z9ZD):**

1. Navigate to **Tags** → Find your **GA4 Configuration** tag
2. Click to edit the tag
3. **Update Tag ID** to: `G-7NR2JG1EDP`
4. Verify tag fires on: **All Pages** (or appropriate trigger)
5. **Submit** → Publish a new container version

**Why this matters:** Ensures all browser-side hits send to the correct GA4 property.

---

### Step 2: Verify GA4 Tag Configuration

**Check these settings in your GA4 Config tag:**

```javascript
// Configuration Parameters (should include)
{
  send_page_view: true,  // Automatic page views
  cookie_flags: 'SameSite=None;Secure',
  anonymize_ip: true,  // Privacy compliance
  allow_google_signals: true,  // For remarketing
  allow_ad_personalization_signals: true
}
```

**Event Parameters to Forward:**
- `client_id`
- `session_id`
- `user_id` (if authenticated)
- `page_location`
- `page_title`
- `page_referrer`

---

### Step 3: Test Real-Time Tracking

**A. Browser DevTools Method:**

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open DevTools → Network tab
3. Filter by: `collect?v=2&tid=G-7NR2JG1EDP`
4. Navigate between pages
5. **Expected:** New request for each route change with:
   - `tid=G-7NR2JG1EDP`
   - `en=page_view`
   - SPA navigation tracking working

**B. GA4 DebugView Method:**

1. In GA4: **Admin** → **DebugView**
2. Visit site in debug mode (add `?gtm_debug=true` to URL)
3. Perform actions:
   - Page load → expect `page_view`
   - Add to cart → expect `add_to_cart`
   - Begin checkout → expect `begin_checkout`
   - Purchase → expect `purchase`

**C. GTM Preview Mode:**

1. Open GTM → Click **Preview**
2. Enter: `http://localhost:3000`
3. Connected browser opens with GTM debug panel
4. Perform test actions and verify:
   - GA4 Config tag fires on All Pages
   - Event tags fire on correct triggers
   - dataLayer variables populate correctly

---

### Step 4: Verify Server-Side Purchase Tracking

**Shopify Webhook → GA4 Measurement Protocol:**

1. Place a test order on production
2. Check GA4 **Realtime** → Events
3. Look for `purchase` event with:
   - `client_id` = Shopify customer session
   - `transaction_id` = Shopify order ID
   - `value` = Order total
   - `currency` = USD
   - `items[]` = Product array

**Implementation location:**
- File: `src/app/api/webhooks/shopify/orders/route.ts`
- Sends to: `https://www.google-analytics.com/mp/collect?measurement_id=G-7NR2JG1EDP`

---

### Step 5: SPA Navigation Verification

**Test React Router page_view tracking:**

```javascript
// AnalyticsWrapper should fire this on route change:
window.gtag('event', 'page_view', {
  page_location: window.location.href,
  page_title: document.title,
  send_to: 'G-7NR2JG1EDP'
});
```

**How to verify:**

1. Open DevTools Console
2. Navigate: Home → Products → Collections
3. Run in console after each navigation:
   ```javascript
   window.dataLayer.filter(e => e.event === 'page_view')
   ```
4. **Expected:** Array grows with each route change
5. **Expected in Network:** New `collect?...&en=page_view` request

---

### Step 6: Update Documentation References

The following docs reference old GA4 IDs and need updates:

| File | Line(s) | Current ID | Needs Update To |
|------|---------|-----------|----------------|
| `docs/GTM_VALIDATION_RESULTS.md` | 34 | G-QCSHJ4TDMY | G-7NR2JG1EDP |
| `src/lib/ga4-real-data.ts` | 11 | 432910849 | (New Property ID) |

**To find new Property ID:**
1. GA4 → Admin → Property Settings
2. Copy the numeric **Property ID** (e.g., 123456789)
3. Update `GA4_PROPERTY_ID` constant in `ga4-real-data.ts`

---

### Step 7: Production Deployment Checklist

Before deploying GA4 changes:

- [ ] GTM container published with `G-7NR2JG1EDP`
- [ ] Test in GTM Preview mode (staging)
- [ ] Verify Measurement Protocol endpoint uses correct ID
- [ ] Update GitHub secrets if `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var is used
- [ ] Clear CDN cache for GTM script
- [ ] Test Realtime view in GA4 post-deployment
- [ ] Verify no console errors in production
- [ ] Run Lighthouse audit (should show G-7NR2JG1EDP in network requests)

---

### Step 8: Optional QA with Tag Assistant

1. Install **Google Tag Assistant Legacy** Chrome extension
2. Visit site and click extension icon
3. **Expected output:**
   ```
   ✅ Google Tag Manager - GTM-WNG6Z9ZD
   ✅ Google Analytics: GA4 - G-7NR2JG1EDP
       ↳ Page View tag fired
       ↳ No errors
   ```

4. Test add-to-cart, checkout flow:
   ```
   ✅ add_to_cart event → GA4
   ✅ begin_checkout event → GA4
   ✅ purchase event → GA4 (after order placement)
   ```

---

## 🚨 Common Issues & Solutions

### Issue 1: Old GA4 ID Still Appearing in Requests

**Symptom:** Network requests show `tid=G-QCSHJ4TDMY` instead of `G-7NR2JG1EDP`

**Solution:**
1. Check GTM container version - may not be published
2. Clear browser cache and GTM cache
3. Verify no hardcoded GA IDs in code:
   ```bash
   grep -r "G-QCSHJ4TDMY" src/
   ```

### Issue 2: SPA Navigation Not Tracking

**Symptom:** Only first page view tracked, subsequent navigations ignored

**Solution:**
1. Check `src/AnalyticsWrapper.tsx` has route change listener
2. Verify `window.gtag` is available globally
3. Check console for errors
4. Test with:
   ```javascript
   window.gtag('event', 'page_view', { page_location: window.location.href });
   ```

### Issue 3: Purchase Events Missing in GA4

**Symptom:** Checkout completes but no `purchase` in GA4 Realtime

**Solution:**
1. Check Shopify webhook delivery in Admin → Settings → Notifications
2. Verify webhook endpoint returns 200 OK
3. Check server logs for Measurement Protocol errors
4. Verify API secret is correct in environment variables
5. Test with:
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/shopify/orders \
     -H "Content-Type: application/json" \
     -d '{"id": 12345, "total_price": "99.99", ...}'
   ```

---

## 📊 Success Metrics

After completing this alignment, you should see in GA4 (within 24-48 hours):

- ✅ **Real-time events** flowing consistently
- ✅ **Page views** from SPA navigation
- ✅ **E-commerce events** (view_item, add_to_cart, purchase)
- ✅ **User engagement** metrics populating
- ✅ **Conversion tracking** working for goals
- ✅ **No tracking errors** in DebugView

---

## 🔗 Related Documentation

- [GTM Validation Guide](./GTM_VALIDATION_GUIDE.md)
- [GTM Audit Summary](./GTM_AUDIT_SUMMARY.md)
- [Analytics Integration Guide](./guides/ANALYTICS_INTEGRATION_GUIDE.md)
- [Analytics Testing Guide](./guides/ANALYTICS_TESTING_GUIDE.md)

---

## 🤖 Automated Checks

Run these npm scripts to validate configuration:

```bash
# Check GTM implementation
npm run check:gtm

# Run full analytics test suite
npm run test:gtm

# Check for analytics errors in dev
npm run dev
# Then visit: http://localhost:3000/gtm-debug.html
```

---

**Last Updated:** 2025-10-29
**Maintained By:** Development Team
**Questions?** Check [docs/guides/ANALYTICS_INTEGRATION_GUIDE.md](./guides/ANALYTICS_INTEGRATION_GUIDE.md)
