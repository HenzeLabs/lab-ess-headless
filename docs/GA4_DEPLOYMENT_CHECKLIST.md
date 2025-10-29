# GA4 Deployment Checklist

**Date:** 2025-10-29
**GA4 Measurement ID:** G-7NR2JG1EDP
**GTM Container:** GTM-WNG6Z9ZD

---

## 📋 Pre-Deployment Checklist

### ✅ Code Changes (Complete)
- [x] UX improvements pushed to git
- [x] Sticky bars implemented
- [x] GTM audit script fixed
- [x] Lighthouse CI workflow fixed
- [x] GA4 alignment guide created
- [x] Environment variables documented
- [x] All CI checks passing

### ⚠️ Manual Steps Required

#### 1. Publish GTM Container (In GTM UI)

**Status:** Draft changes made, need to publish

**Steps:**
1. Go to: https://tagmanager.google.com/
2. Select container: **GTM-WNG6Z9ZD**
3. Click **Submit** button (top right)
4. Version Name: `"Update GA4 to G-7NR2JG1EDP"`
5. Version Description:
   ```
   - Updated GA4 Config tag to use G-7NR2JG1EDP
   - Aligned measurement ID with production property
   - Tested in Preview mode
   ```
6. Click **Publish**

**Verification:**
- GTM container version increments
- Changes are live immediately (served from Google's CDN)
- No code deployment needed for GTM changes

---

#### 2. Configure Vercel Environment Variables

**Status:** Need to add to Vercel dashboard

**Required Variables:**

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-7NR2JG1EDP` | Client-side GA4 measurement ID |
| `GA4_MEASUREMENT_ID` | `G-7NR2JG1EDP` | Server-side GA4 measurement ID (already set) |
| `GA4_MEASUREMENT_PROTOCOL_SECRET` | `Y-eokJURRGCDdOpXsNm2dw` | GA4 Measurement Protocol secret (already set) |

**Steps:**
1. Go to Vercel dashboard: https://vercel.com/
2. Select your project: `lab-ess-headless`
3. Go to **Settings** → **Environment Variables**
4. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID`:
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-7NR2JG1EDP`
   - Environments: Production, Preview, Development (all checked)
5. Click **Save**

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

#### 3. Deploy to Production

**Status:** Ready to deploy

**Option A: Automatic Deployment (Recommended)**
```bash
# Push to main branch triggers automatic Vercel deployment
git status
# Verify all changes are committed and pushed
```

**Option B: Manual Deployment**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

**Deployment includes:**
- All UX improvements (sticky bars, mobile optimization, etc.)
- GTM audit script fixes
- Environment variable references
- Updated documentation

---

## 🧪 Post-Deployment Verification

### Step 1: Verify GTM Container is Live

**In Browser:**
1. Visit production site: https://your-domain.com
2. Open DevTools → **Network** tab
3. Filter by: `gtm.js`
4. Check request URL contains: `GTM-WNG6Z9ZD`
5. Response should show updated container version

**Expected:** GTM container loads with published version

---

### Step 2: Verify GA4 Tracking

**In Browser DevTools:**
1. Open DevTools → **Network** tab
2. Filter by: `collect?v=2`
3. Navigate through site (homepage → product → collection)
4. Check each request for:
   - `tid=G-7NR2JG1EDP` ✅
   - `en=page_view` ✅
   - Valid `client_id` ✅

**Expected:** All GA4 requests use `G-7NR2JG1EDP`

---

### Step 3: Check GA4 DebugView

**In GA4:**
1. Go to: https://analytics.google.com/
2. Navigate to: **Admin** → **DebugView**
3. Open production site in another tab
4. Add `?gtm_debug=true` to URL (or use Tag Assistant)
5. Perform test actions:
   - Page load → expect `page_view`
   - Navigate → expect `page_view` (SPA)
   - View product → expect `view_item`
   - Add to cart → expect `add_to_cart`

**Expected:** Events appear in DebugView within ~30 seconds

---

### Step 4: Check GA4 Realtime Reports

**In GA4:**
1. Go to: **Reports** → **Realtime**
2. Keep this open while testing
3. In another browser tab, visit production site
4. Perform user actions (browse, add to cart, etc.)

**Expected:**
- Active users count increases
- Events appear in event list
- Page views show correct paths
- E-commerce events tracked

---

### Step 5: Verify SPA Navigation Tracking

**Test Single-Page App Navigation:**
```javascript
// In DevTools Console
// Navigate: Home → Products → Collections
// After each navigation, run:
window.dataLayer.filter(e => e.event === 'page_view')
// Array should grow with each route change
```

**In Network Tab:**
- Each route change triggers new `collect?v=2&en=page_view` request
- Each request has `tid=G-7NR2JG1EDP`

**Expected:** SPA navigation fires page_view events

---

### Step 6: Verify Server-Side Purchase Tracking

**Test Checkout Flow:**
1. Complete a test purchase on production
2. Check GA4 **Realtime** → **Events**
3. Look for `purchase` event with:
   - `transaction_id` = Shopify order ID
   - `value` = order total
   - `currency` = USD
   - `items[]` = product array
   - `client_id` = customer session

**Expected:** Purchase event appears in GA4 from server-side webhook

---

### Step 7: Verify Consent Mode

**Check Consent Mode V2:**
```javascript
// In DevTools Console
window.dataLayer.filter(e => e[0] === 'consent')
// Should show initial 'default' (denied) and 'update' (granted) on interaction
```

**Expected:**
- Initial state: `analytics_storage: 'denied'`
- After interaction: `analytics_storage: 'granted'`
- Hits only sent after consent granted

---

## 🚨 Troubleshooting

### Issue: Old GA4 ID Still Appearing

**Symptom:** Network requests show wrong measurement ID

**Solutions:**
1. Clear browser cache and cookies
2. Clear GTM cache (wait 5-10 minutes)
3. Verify GTM container was published (not just saved as draft)
4. Check GTM container version number incremented
5. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

### Issue: No Events in DebugView

**Symptom:** DebugView shows no events

**Solutions:**
1. Verify `?gtm_debug=true` is in URL
2. Check GTM Preview mode is **not** active (conflicts with DebugView)
3. Ensure GA4 property ID matches (check Admin → Property Settings)
4. Check browser extensions aren't blocking analytics
5. Verify consent mode granted (check console for `analytics_storage`)

---

### Issue: SPA Navigation Not Tracking

**Symptom:** Only first page view tracked

**Solutions:**
1. Check AnalyticsWrapper is mounted (view React DevTools)
2. Check `window.gtag` is available globally
3. Look for errors in console
4. Test manual page_view:
   ```javascript
   window.gtag('event', 'page_view', {
     page_location: window.location.href
   });
   ```

---

### Issue: Purchase Events Missing

**Symptom:** Checkout completes but no purchase in GA4

**Solutions:**
1. Check Shopify webhook delivery (Admin → Settings → Notifications)
2. Verify webhook endpoint returns 200 OK
3. Check server logs for Measurement Protocol errors
4. Verify `GA4_MEASUREMENT_PROTOCOL_SECRET` is correct in Vercel
5. Test webhook endpoint manually:
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/shopify/orders \
     -H "Content-Type: application/json" \
     -H "X-Shopify-Topic: orders/create" \
     -d '{"id": 12345, "total_price": "99.99", ...}'
   ```

---

## ✅ Success Criteria

After deployment, you should see:

- [✅] GTM container published with new version
- [✅] Vercel environment variables configured
- [✅] Production deployment successful
- [✅] GA4 requests use `tid=G-7NR2JG1EDP`
- [✅] DebugView shows real-time events
- [✅] Realtime reports show active users
- [✅] SPA navigation triggers page_view
- [✅] E-commerce events tracked
- [✅] Purchase events from server-side webhook
- [✅] Consent mode functioning correctly
- [✅] No console errors
- [✅] All UX improvements live (sticky bars, etc.)

---

## 📊 Post-Deploy Monitoring

**First 24 Hours:**
- Monitor GA4 Realtime for traffic
- Check DebugView for any errors
- Verify conversion events tracking
- Monitor server logs for webhook errors

**First Week:**
- Compare event counts to previous week
- Verify revenue tracking accuracy
- Check for any tracking gaps
- Review user engagement metrics

**Ongoing:**
- Set up GA4 alerts for tracking failures
- Monitor Measurement Protocol errors
- Review monthly analytics data quality
- Update documentation as needed

---

## 🔗 Related Documentation

- [GA4_ALIGNMENT_GUIDE.md](./GA4_ALIGNMENT_GUIDE.md) - Comprehensive setup guide
- [GTM_VALIDATION_RESULTS.md](./GTM_VALIDATION_RESULTS.md) - Validation results
- [GTM_VALIDATION_GUIDE.md](./GTM_VALIDATION_GUIDE.md) - Testing guide
- [Analytics Integration Guide](./guides/ANALYTICS_INTEGRATION_GUIDE.md) - Full integration docs

---

## 📝 Deployment Log

| Date | Action | Status | Notes |
|------|--------|--------|-------|
| 2025-10-29 | Code changes pushed to git | ✅ Complete | All UX improvements, CI fixes |
| 2025-10-29 | GTM container updated (draft) | ⚠️ Pending | Need to publish in GTM UI |
| 2025-10-29 | Environment vars documented | ✅ Complete | .env.example updated |
| 2025-10-29 | Vercel env vars | ⏳ Pending | Add NEXT_PUBLIC_GA_MEASUREMENT_ID |
| 2025-10-29 | Production deployment | ⏳ Pending | Deploy to Vercel |
| 2025-10-29 | Post-deploy verification | ⏳ Pending | DebugView, Realtime |

---

**Last Updated:** 2025-10-29
**Maintained By:** Development Team
**Questions?** See [GA4_ALIGNMENT_GUIDE.md](./GA4_ALIGNMENT_GUIDE.md)
