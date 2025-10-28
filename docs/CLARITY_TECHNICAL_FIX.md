# Microsoft Clarity Technical Fix - GTM Custom HTML Tag Not Firing

**Date:** 2025-10-27
**Issue:** `window.clarity` undefined, no network calls to clarity.ms
**Root Cause:** GTM loading timing + Next.js hydration conflict

---

## 🔍 Technical Analysis

### Current Architecture

**GTM Loading Method:**
```tsx
// src/AnalyticsWrapper.tsx (Line 116-119)
<Script
  src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
  strategy="afterInteractive"  // ← PROBLEM
/>
```

**What `afterInteractive` means:**
- GTM loads **AFTER** page becomes interactive
- GTM loads **AFTER** React hydration completes
- GTM Custom HTML tags execute **AFTER** component mount
- This can cause tags to fire **late** or **not at all** in Next.js App Router

### Problems Identified

#### Problem #1: GTM Load Timing ⚠️

**Current:** `strategy="afterInteractive"`
- Loads: After page interactive (~2-3 seconds)
- Custom HTML tags execute: After GTM fully initialized
- Clarity script injection: Delayed by 3-5 seconds

**Result:**
- `window.clarity` not available during initial page load
- Analytics events fire before Clarity loads
- User may navigate away before Clarity initializes

#### Problem #2: Next.js Script Hydration 🔍

Next.js App Router can **remove or replace** `<script>` tags during hydration if they're not server-side rendered.

**GTM Custom HTML tags:**
1. GTM injects `<script>` into DOM
2. Next.js hydration may remove non-SSR scripts
3. Clarity never loads

#### Problem #3: CSP Headers ✅

**Status:** CSP is correctly configured

```javascript
// next.config.mjs (Line 129-130)
"script-src ... https://www.clarity.ms"       // ✅ Allows Clarity script
"connect-src ... https://*.clarity.ms"        // ✅ Allows Clarity data sends
```

**CSP is NOT blocking Clarity.**

---

## ✅ Solution: Three-Step Fix

### Fix #1: Change GTM Trigger (CRITICAL)

**Current Trigger:** `All Pages` (Page View)
**New Trigger:** `Initialization - All Pages`

**Why this matters:**
- **Page View** trigger fires AFTER page loads
- **Initialization** trigger fires IMMEDIATELY when GTM loads
- Initialization ensures Custom HTML executes before React hydration

**How to change in GTM:**

1. Open GTM container: GTM-WNG6Z9ZD
2. Go to **Tags** → "Microsoft Clarity – Custom"
3. Click **Triggering** section
4. **Remove:** "All Pages" trigger
5. **Add New Trigger:**
   - Click **"+"** to create trigger
   - Trigger Type: **"Initialization - All Pages"**
   - Name: `Initialization - All Pages`
   - Save trigger
6. Apply to Clarity tag
7. **Save and Publish**

**Expected Result:**
- Clarity loads immediately when GTM initializes
- `window.clarity` available before page hydration
- No conflict with Next.js script management

---

### Fix #2: Move GTM to Document Head (RECOMMENDED)

**Current:** GTM loads via component with `afterInteractive`
**Better:** GTM in `<head>` with synchronous loading

**Option A: Keep AnalyticsWrapper, Change Strategy**

Edit `src/AnalyticsWrapper.tsx`:

```tsx
// BEFORE (Line 116-119)
<Script
  src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
  strategy="afterInteractive"  // ← Change this
/>

// AFTER
<Script
  src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
  strategy="beforeInteractive"  // ← Loads before page interactive
/>
```

**Benefits:**
- GTM loads before React hydration
- Custom HTML tags execute earlier
- Less likely to conflict with Next.js

**Tradeoff:**
- Slightly delays Time to Interactive (~100-200ms)
- Worth it for analytics reliability

---

**Option B: Inline GTM in layout.tsx Head (BEST)**

Edit `src/app/layout.tsx` (add after line 90):

```tsx
<head>
  {/* ... existing preconnects ... */}

  {/* GTM - Inline for immediate execution */}
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-WNG6Z9ZD');
      `,
    }}
  />
</head>
```

**Then remove GTM script from AnalyticsWrapper.tsx** (keep only dataLayer initialization)

**Benefits:**
- GTM loads synchronously in `<head>`
- Guaranteed to execute before React hydration
- Custom HTML tags work reliably
- Industry best practice

**Tradeoff:**
- None - this is how GTM recommends installation

---

### Fix #3: Add Clarity Failsafe (OPTIONAL BUT RECOMMENDED)

If GTM fails to load Clarity, have a fallback.

**Add to `src/app/layout.tsx` head:**

```tsx
{/* Clarity failsafe - loads if GTM fails */}
<script
  dangerouslySetInnerHTML={{
    __html: `
      // Only load if GTM hasn't loaded Clarity after 5 seconds
      setTimeout(function() {
        if (typeof window.clarity === 'undefined') {
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "m5xby3pax0");
        }
      }, 5000);
    `,
  }}
/>
```

**What this does:**
- Waits 5 seconds for GTM to load Clarity
- If `window.clarity` still undefined, loads directly
- Ensures Clarity always loads, even if GTM fails

---

## 🧪 Testing & Verification

### Step 1: Verify GTM Loads

```javascript
// Browser console
window.dataLayer
// Expected: Array with GTM events

window.google_tag_manager
// Expected: Object with GTM config
```

### Step 2: Verify Clarity Loads

```javascript
// Browser console
window.clarity
// Expected: ƒ () { [native code] }

// Check script loaded
document.querySelector('script[src*="clarity.ms"]')
// Expected: <script src="https://www.clarity.ms/tag/m5xby3pax0">
```

### Step 3: Network Validation

**Open DevTools → Network tab:**

1. Filter by: `clarity`
2. Reload page
3. **Expected:**
   - `https://www.clarity.ms/tag/m5xby3pax0` (200 OK)
   - `https://www.clarity.ms/collect` (POST, 200 OK)

### Step 4: GTM Preview Mode

1. GTM → **Preview**
2. Enter site URL
3. **Verify:**
   - "Microsoft Clarity – Custom" tag shows **Fired**
   - Fires on: **Initialization - All Pages**
   - No errors in Tag Status

### Step 5: Clarity Dashboard

Wait 5-10 minutes, then check:
https://clarity.microsoft.com/projects/view/m5xby3pax0

**Expected:**
- Live users count > 0
- Sessions appearing
- Recordings starting

---

## 📊 Recommended Implementation Order

### Priority 1: Quick Fix (5 minutes)

**Change GTM trigger to Initialization:**
1. GTM → Tags → "Microsoft Clarity – Custom"
2. Change trigger: `All Pages` → `Initialization - All Pages`
3. Publish

**Test:** Verify `window.clarity` loads within 2-3 seconds

---

### Priority 2: Optimal Fix (15 minutes)

**Move GTM to inline in layout.tsx `<head>`:**
1. Add inline GTM script to `src/app/layout.tsx` (Option B above)
2. Remove GTM `<Script>` from `src/AnalyticsWrapper.tsx`
3. Keep dataLayer initialization in AnalyticsWrapper
4. Deploy

**Test:** Verify GTM loads before hydration, Clarity loads immediately

---

### Priority 3: Bulletproof Fix (20 minutes)

**Add Clarity failsafe:**
1. Complete Priority 1 & 2
2. Add failsafe script to layout.tsx
3. Deploy
4. Test by blocking GTM in DevTools
5. Verify Clarity still loads after 5 seconds

---

## 🔧 Troubleshooting

### Issue: Clarity loads but data delayed

**Cause:** Clarity batches data sends every 10-30 seconds

**Fix:** Normal behavior, wait 1-2 minutes for first data

---

### Issue: window.clarity is a function but dashboard shows 0

**Possible Causes:**
1. Project ID mismatch
2. Domain not allowed in Clarity project settings
3. Adblocker blocking requests

**Fix:**
1. Verify script uses correct ID: `m5xby3pax0`
2. Clarity dashboard → Settings → Allowed domains → Add `labessentials.com`
3. Test in incognito mode

---

### Issue: GTM loads but Clarity tag doesn't fire

**Cause:** Trigger timing or tag configuration

**Fix:**
1. Use **Initialization trigger** (not Page View)
2. Verify tag is **not paused**
3. Check tag has no firing conditions/exceptions
4. Publish GTM container

---

## 📋 Summary

### Root Causes:
1. ❌ GTM loads `afterInteractive` (too late)
2. ❌ Clarity tag uses Page View trigger (should be Initialization)
3. ❌ Next.js may remove injected `<script>` during hydration
4. ✅ CSP is correctly configured (not the issue)

### Fixes:
1. **Change GTM trigger** → Initialization - All Pages ⚡ CRITICAL
2. **Move GTM to `<head>`** → Inline script in layout.tsx (best practice)
3. **Add failsafe** → Direct Clarity load if GTM fails (optional)

### Expected Results:
- ✅ `window.clarity` available in <2 seconds
- ✅ Clarity dashboard shows sessions within 5-10 minutes
- ✅ No CSP errors
- ✅ No hydration conflicts

---

**Created:** 2025-10-27
**Next Action:** Change GTM trigger to Initialization, test, then implement inline GTM
