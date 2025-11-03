# Analytics Diagnostic Report
**Date**: November 3, 2025
**Status**: 🔍 Investigating Data Visibility Issues

---

## Executive Summary

Your analytics infrastructure is **correctly configured**, but you're not seeing data in GA4 or Shopify analytics. This report identifies the likely causes and provides actionable solutions.

## ✅ What's Working

### 1. GA4 Configuration
- **Measurement ID**: `G-7NR2JG1EDP` ✅
- **GTM Container**: `GTM-WNG6Z9ZD` ✅ (Installed in [src/app/layout.tsx](src/app/layout.tsx:98))
- **Environment Variables**: Properly set in `.env.local`
- **Measurement Protocol**: Configured for server-side tracking
- **API Secret**: Present (`GA4_MEASUREMENT_PROTOCOL_SECRET`)

### 2. GTM Integration
- **Installation**: GTM script loads inline in `<head>` before React hydration
- **DataLayer**: Initialized in [AnalyticsWrapper.tsx](src/AnalyticsWrapper.tsx:16)
- **Consent Mode V2**: Configured (analytics_storage defaults to 'denied', grants on interaction)

### 3. Shopify Integration
- **Storefront API**: Connected (`labessentials.myshopify.com`)
- **Admin API**: Authenticated (`SHOPIFY_ADMIN_ACCESS_TOKEN` present)
- **Webhook Handler**: Implemented at `/api/webhooks/shopify/orders`
- **HMAC Verification**: Secure webhook authentication enabled

### 4. Event Tracking Code
- **Client-Side Events**: Implemented via gtag() calls
  - Page views
  - Product views (view_item)
  - Add to cart (add_to_cart)
  - Begin checkout (begin_checkout)
  - Search
- **Server-Side Events**: Purchase tracking via Measurement Protocol

---

## ⚠️ Likely Issues & Solutions

### Issue 1: Consent Mode Blocking Analytics

**Problem**: Your Consent Mode V2 configuration defaults to `analytics_storage: 'denied'`, which **blocks GA4 from collecting data** until user consent is granted.

**Location**: [src/AnalyticsWrapper.tsx](src/AnalyticsWrapper.tsx:26-33)

```typescript
win.gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',  // 🚨 This blocks GA4
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
});
```

**Why This Matters**:
- GA4 respects consent settings
- With `analytics_storage: 'denied'`, GA4 **won't track page views, events, or any analytics data**
- Data only starts flowing after user interacts (click, scroll, touch)

**Solution Options**:

**Option A: Auto-grant consent** (simplest for testing):
```typescript
win.gtag('consent', 'default', {
  ad_storage: 'granted',
  analytics_storage: 'granted',  // ✅ Analytics enabled by default
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
});
```

**Option B: Add a cookie consent banner** (GDPR-compliant):
- Implement a cookie consent banner (e.g., OneTrust, CookieBot)
- Call `gtag('consent', 'update', {...})` when user accepts
- Keep current denied-by-default for compliance

**Option C: Use Analytics Exemption** (if applicable):
- Check if your jurisdiction allows analytics without explicit consent
- Many regions allow "necessary" analytics for site functionality

---

### Issue 2: No GTM Tags Configured

**Problem**: GTM container is installed, but **may not have GA4 tags configured inside it**.

**How to Check**:
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Open container `GTM-WNG6Z9ZD`
3. Check if you have these tags:
   - **GA4 Configuration Tag** (fires on all pages)
   - **GA4 Event Tags** (view_item, add_to_cart, begin_checkout, purchase)

**What You Should See**:
- GA4 Config tag with Measurement ID `G-7NR2JG1EDP`
- Triggers set for page views and events
- Tags firing in GTM Preview mode

**If Tags Missing**:
1. Add GA4 Configuration tag:
   - Tag Type: Google Analytics: GA4 Configuration
   - Measurement ID: `G-7NR2JG1EDP`
   - Trigger: All Pages

2. Add Event tags:
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `{{Event}}` (use dataLayer variable)
   - Configuration Tag: [Select your GA4 Config tag]
   - Trigger: Custom Event (matches your tracked events)

---

### Issue 3: Shopify Webhook Not Registered

**Problem**: Webhook handler exists, but webhook may not be registered in Shopify Admin.

**Status**: Checking... (webhook script is running)

**How to Register Webhook**:
1. Go to Shopify Admin: https://labessentials.myshopify.com/admin
2. Navigate to **Settings → Notifications → Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Event**: Order creation
   - **Format**: JSON
   - **URL**: `https://store.labessentials.com/api/webhooks/shopify/orders`
   - **API Version**: 2025-07

**Required Environment Variable**:
```bash
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
```
- Get this from Shopify after creating the webhook
- Add to `.env.local` and redeploy

**Test Webhook**:
```bash
curl -X POST https://store.labessentials.com/api/webhooks/shopify/orders/test
```

---

### Issue 4: Development vs Production Environment

**Problem**: Running on localhost (http://localhost:3000) instead of production.

**Why This Matters**:
- GA4 may filter localhost traffic
- Shopify webhooks only fire in production
- GTM may not track in development mode

**Solution**:
1. **Deploy to production** (Vercel): https://store.labessentials.com
2. **Test on production URL** to see real analytics data
3. Or **disable localhost filtering** in GA4:
   - GA4 → Admin → Data Streams → Configure stream
   - Under "Advanced settings" → Include internal traffic

---

### Issue 5: GA4 Data Delay

**Problem**: GA4 has a processing delay of **24-48 hours** for standard reports.

**What to Check**:
1. **Realtime Report** (immediate):
   - GA4 → Reports → Realtime
   - Should show activity within seconds
   - If no realtime data → tracking not working

2. **DebugView** (recommended):
   - GA4 → Configure → DebugView
   - Add `?gtm_debug=true` to URL
   - See events in real-time with full parameters

3. **Browser DevTools**:
   - Network tab → Filter: "google-analytics.com" or "collect"
   - Look for requests with `tid=G-7NR2JG1EDP`
   - Status 200 = events sending successfully

---

## 🔧 Immediate Action Steps

### Step 1: Update Consent Mode (Testing)
```typescript
// src/AnalyticsWrapper.tsx line 26
win.gtag('consent', 'default', {
  ad_storage: 'granted',
  analytics_storage: 'granted',  // Change this
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
});
```

### Step 2: Verify GTM Tags
1. Go to https://tagmanager.google.com
2. Open `GTM-WNG6Z9ZD`
3. Enable Preview mode
4. Visit your site
5. Check if GA4 Config tag fires

### Step 3: Test on Production
1. Deploy latest changes to Vercel
2. Visit https://store.labessentials.com
3. Open GA4 Realtime report
4. Navigate through site
5. Check if you appear in Realtime

### Step 4: Check Browser Console
```javascript
// Run in browser console on your site:
console.log('GTM:', window.google_tag_manager);
console.log('DataLayer:', window.dataLayer);
console.log('gtag:', typeof window.gtag);

// Should see:
// - GTM container loaded
// - dataLayer array with events
// - gtag function defined
```

### Step 5: Test GA4 Measurement Protocol
```bash
# Test server-side GA4 tracking
curl -X POST \
  "https://www.google-analytics.com/mp/collect?measurement_id=G-7NR2JG1EDP&api_secret=Y-eokJURRGCDdOpXsNm2dw" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test_user_123",
    "events": [{
      "name": "test_event",
      "params": {
        "test_parameter": "test_value"
      }
    }]
  }'
```
Then check GA4 DebugView within 1 minute.

---

## 📊 Analytics Data Flow

```
User Action (e.g., Add to Cart)
          ↓
Client-Side gtag() call
          ↓
GTM Container (GTM-WNG6Z9ZD)
          ↓
GA4 Tag (if configured)
          ↓
GA4 Property (G-7NR2JG1EDP)
          ↓
GA4 Realtime Report (immediate)
          ↓
GA4 Standard Reports (24-48h delay)
```

```
Shopify Order Created
          ↓
Shopify Webhook (if registered)
          ↓
/api/webhooks/shopify/orders
          ↓
Verify HMAC Signature
          ↓
Send to GA4 Measurement Protocol
          ↓
Send to Taboola S2S
          ↓
GA4 Property (G-7NR2JG1EDP)
```

---

## 🎯 Expected Results After Fixes

### GA4 Realtime Report Should Show:
- Active users (you) browsing
- Page views
- Events (view_item, add_to_cart, etc.)
- Geographic location
- Device/browser info

### GA4 DebugView Should Show:
- All events with full parameters
- Event names matching your tracking code
- No errors or warnings

### Shopify Analytics Should Show:
- Order data from Shopify Admin
- Synced with GA4 purchase events (via webhook)

---

## 📝 Next Steps

1. **Update consent mode** in [src/AnalyticsWrapper.tsx](src/AnalyticsWrapper.tsx:26) ← START HERE
2. **Verify GTM tags** are configured in GTM dashboard
3. **Deploy to production** and test on live URL
4. **Check GA4 Realtime** immediately after visiting site
5. **Register Shopify webhook** in Shopify Admin
6. **Test with debug mode**: Add `?gtm_debug=true` to URL

---

## 🆘 Still Not Working?

If you've tried all the above and still see no data:

1. **Share GA4 Realtime screenshot**: Are there ANY users showing?
2. **Share browser console logs**: Any errors related to GTM or GA4?
3. **Share GTM Preview output**: Do tags fire in preview mode?
4. **Check GA4 property permissions**: Do you have access to `G-7NR2JG1EDP`?
5. **Verify measurement ID**: Is `G-7NR2JG1EDP` the correct property?

---

## 📚 Resources

- [GA4 DebugView Documentation](https://support.google.com/analytics/answer/7201382)
- [GTM Preview Mode Guide](https://support.google.com/tagmanager/answer/6107056)
- [Consent Mode V2 Guide](https://developers.google.com/tag-platform/security/guides/consent)
- [Shopify Webhook Setup](./SHOPIFY_WEBHOOK_SETUP.md)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

---

**Last Updated**: November 3, 2025
**Status**: ⏳ Awaiting fixes and testing
