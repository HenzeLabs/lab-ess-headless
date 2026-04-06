# Issues to Fix

**Date**: November 3, 2025

---

## 🚨 Issue 1: Newsletter Signup Fails

**Current Behavior**: "We could not complete your signup. Please try again"

**Root Cause**: Shopify Admin API is returning **403 Forbidden** despite permissions being granted. This happens when:
- The access token doesn't match the app with those permissions
- The app needs to be reinstalled after permission changes
- There's an IP restriction or API rate limit

**Testing Shows**:
```
[newsletter] customer search failed 403
[newsletter] contact form fallback failed 403
```

**Fix Required**:
1. **Regenerate Shopify Admin Access Token** (Most Likely Fix):
   - Go to: https://labessentials.myshopify.com/admin/settings/apps/development
   - Find your custom app
   - Click "Rotate API credentials" or "Regenerate admin API access token"
   - Copy new token
   - Update `.env.local`: `SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_new_token_here`
   - Restart dev server

2. **Verify API endpoint access**:
   ```bash
   curl -X GET \
     "https://labessentials.myshopify.com/admin/api/2025-07/customers.json?limit=1" \
     -H "X-Shopify-Access-Token: YOUR_TOKEN_HERE"
   ```
   Should return 200, not 403

3. **Temporary Workaround Applied**:
   - Updated error message to show: "Newsletter signup is temporarily unavailable. Please email us at support@labessentials.com to subscribe."
   - Added better error logging to diagnose the issue

**Status**: ⚠️ Partially Fixed - Better error message added, but root cause (403) needs token regeneration

---

## ✅ Issue 2: Shipping Terms Inconsistencies

**Your Concerns**:
- "Support -> Shipping Info - We offer free shipping for orders over $100? $75 for overnight shipments? Expedited Shipping 2-3 business days $25 flat rate?"
- "About US -> free shipping over $300"

**Audit Results**: Actually, shipping terms are **CORRECT** throughout the site! All mention **$300** threshold:

### Files Checked - All Correct ✅:

1. **[src/app/support/shipping/page.tsx](src/app/support/shipping/page.tsx:44)**
   - "1-3 business days • **Free on orders over $300**" ✅

2. **[src/app/about/page.tsx](src/app/about/page.tsx:129)**
   - "**Free Shipping over $300**" ✅

3. **[src/app/support/faq/page.tsx](src/app/support/faq/page.tsx:49)**
   - "Orders over **$300** qualify for free shipping" ✅

4. **[src/components/AnnouncementBar.tsx](src/components/AnnouncementBar.tsx:15)**
   - "Free shipping on orders over **$300**" ✅

5. **[src/components/StickyCTABar.tsx](src/components/StickyCTABar.tsx:49)**
   - "Free shipping on orders over **$300**" ✅

6. **[src/components/product/TrustBar.tsx](src/components/product/TrustBar.tsx:21)**
   - "Free Shipping over **$300**" ✅

7. **[src/components/CTASection.tsx](src/components/CTASection.tsx:103)**
   - "Free Shipping **$300+**" ✅

8. **[src/components/ProductInfoPanel.tsx](src/components/ProductInfoPanel.tsx:177)**
   - "Free shipping over **$300**" ✅

9. **[src/lib/ai/personalization.ts](src/lib/ai/personalization.ts:463)**
   - "Free shipping on orders over **$300**" ✅

10. **All Collections Pages** ✅
11. **All Product Pages** ✅

### ❌ NO instances found of:
- "$100 free shipping"
- "$75 overnight"
- "$25 flat rate expedited"

**Conclusion**: Shipping terms are **consistently $300** across the entire site. The inconsistencies you mentioned do **NOT exist** in the codebase.

**Status**: ✅ No action needed - Already correct

---

## 📋 Summary

| Issue | Status | Priority | Action Required |
|-------|--------|----------|-----------------|
| Newsletter signup error | ❌ Not Fixed | High | Enable Shopify `read_customers` scope |
| Shipping term inconsistencies | ✅ Already Correct | N/A | None - all say $300 |

---

## 🔧 Immediate Action: Fix Newsletter

The only real issue is the newsletter signup. Here's how to fix it:

### Step 1: Check Shopify API Permissions

```bash
curl -X GET \
  "https://labessentials.myshopify.com/admin/api/2025-07/customers.json?limit=1" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ADMIN_ACCESS_TOKEN}"
```

**If you get 403 Forbidden**: You need to enable `read_customers` scope

### Step 2: Enable read_customers Scope

1. Go to: https://labessentials.myshopify.com/admin/settings/apps
2. Find your custom app (the one that generated `SHOPIFY_ADMIN_ACCESS_TOKEN`)
3. Click "Edit"
4. Under "Admin API access scopes", enable:
   - ✅ `read_customers`
   - ✅ `write_customers`
5. Save and regenerate token if prompted
6. Update `.env.local` with new token if changed

### Step 3: Test Newsletter Signup

After enabling permissions:
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Should return: `{"ok":true}`

---

## 📝 Notes

- The shipping page does NOT contain "$100", "$75", or "$25" rates anywhere
- All references consistently show "$300" free shipping threshold
- The About page correctly shows "$300" (line 129)
- The Support/Shipping page correctly shows "$300" (line 44)

**Recommendation**: Double-check where you saw the inconsistent shipping terms, as they don't exist in the current codebase. They may have been from:
- An old cached version
- A different environment
- A different site

---

**Last Updated**: November 3, 2025
