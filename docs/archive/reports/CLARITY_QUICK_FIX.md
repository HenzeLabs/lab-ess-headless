# Microsoft Clarity - Quick Fix Guide

**Status**: ⚠️ **ALMOST WORKING** - Just needs `NEXT_PUBLIC_` variable and initialization

---

## What I Found

✅ **Good news**:
- Clarity credentials ARE in Vercel
- `CLARITY_PROJECT_ID` exists (server-side)
- `CLARITY_API` exists (for API calls)

❌ **The issue**:
- Missing `NEXT_PUBLIC_CLARITY_PROJECT_ID` (client-side)
- Clarity script not initialized in code

---

## Quick Fix (2 Steps)

### Step 1: Add Client-Side Environment Variable to Vercel

The `NEXT_PUBLIC_` prefix makes the variable available to browser JavaScript.

**Option A: Via Vercel Dashboard** (Recommended)
1. Go to https://vercel.com/[your-team]/[your-project]/settings/environment-variables
2. Click "Add New"
3. **Key**: `NEXT_PUBLIC_CLARITY_PROJECT_ID`
4. **Value**: Same value as `CLARITY_PROJECT_ID` (get it from existing var)
5. **Environments**: Check all (Production, Preview, Development)
6. Click "Save"

**Option B: Via Vercel CLI**
```bash
# Get the current CLARITY_PROJECT_ID value first
npx vercel env pull .env.vercel

# Add the NEXT_PUBLIC version
npx vercel env add NEXT_PUBLIC_CLARITY_PROJECT_ID

# When prompted:
# - Enter the same value as CLARITY_PROJECT_ID
# - Select all environments (Production, Preview, Development)
```

### Step 2: Initialize Clarity Script

**Edit src/AnalyticsWrapper.tsx**

Add the Clarity initialization:

```typescript
'use client';

import { useEffect } from 'react';
import { initClarity } from '@/lib/clarity/events'; // ADD THIS

export default function AnalyticsWrapper() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      __labAnalytics?: Record<string, unknown>;
    };

    // Initialize dataLayer and gtag immediately (before GTM script loads)
    win.dataLayer = win.dataLayer || [];
    win.gtag =
      win.gtag ||
      function (...args) {
        win.dataLayer = win.dataLayer || [];
        win.dataLayer.push(args);
      };

    // Configure Consent Mode V2 (granted by default for analytics tracking)
    if (win.gtag) {
      win.gtag('consent', 'default', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      });
    }

    // ========== ADD THIS: Initialize Microsoft Clarity ==========
    initClarity();
    // ============================================================

    // Load analytics helpers lazily after idle - reduces TBT
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // ... existing code ...
      });
    } else {
      // ... existing code ...
    }
  }, []);

  return (
    <>
      {/* GTM now loads inline in layout.tsx <head> for immediate execution */}
      {/* This component initializes dataLayer and configures Consent Mode V2 */}
    </>
  );
}
```

### Step 3: Deploy

```bash
# Commit the code change
git add src/AnalyticsWrapper.tsx
git commit -m "Initialize Microsoft Clarity tracking"
git push

# Vercel will auto-deploy, or trigger manually
npx vercel --prod
```

---

## Verification Steps

### 1. Check Vercel Environment Variables

```bash
npx vercel env ls | grep CLARITY
```

**Expected output**:
```
CLARITY_PROJECT_ID                 Encrypted           Development, Preview, Production
CLARITY_API                        Encrypted           Development, Preview, Production
NEXT_PUBLIC_CLARITY_PROJECT_ID     Encrypted           Development, Preview, Production  ← NEW
```

### 2. Check Production Site

After deployment, visit your production site and open browser console:

```javascript
// Should see Clarity loaded
console.log(window.clarity);
// Expected: function(...) {...}

// Or check for Clarity cookie
document.cookie.split(';').find(c => c.includes('_clck'))
// Expected: "_clck=abc123..."
```

### 3. Check Network Requests

Open DevTools → Network tab → Filter: `clarity.ms`

**Should see**:
```
GET https://www.clarity.ms/tag/[YOUR_PROJECT_ID]
Status: 200
```

### 4. Verify in Clarity Dashboard

1. Go to https://clarity.microsoft.com/
2. Select your project
3. Navigate to "Dashboard"
4. Visit your site in another tab
5. Wait 1-2 minutes
6. Refresh Clarity dashboard
7. **Should see**: Active sessions appearing

### 5. Test API Endpoint

```bash
curl https://store.labessentials.com/api/metrics/clarity
```

**Expected** (after a few hours of traffic):
```json
{
  "totalSessions": 45,
  "deadClicks": 3,
  "rageClicks": 1,
  "quickBacks": 2,
  "avgScrollDepth": 67.5,
  "heatmapUrl": "https://clarity.microsoft.com/projects/view/[PROJECT_ID]/heatmaps"
}
```

**Current** (until traffic builds up):
```json
{
  "error": "Clarity not configured or no data available"
}
```
This is OK initially - it takes a few hours to collect data.

---

## Why Two Variables?

**`CLARITY_PROJECT_ID`** (server-side only):
- Used by `/api/metrics/clarity` endpoint
- Fetches analytics data from Clarity API
- NOT exposed to browser (secure)

**`NEXT_PUBLIC_CLARITY_PROJECT_ID`** (client-side):
- Used by browser to load Clarity tracking script
- Enables session recording, heatmaps
- Safe to expose (it's public by design)
- Next.js requires `NEXT_PUBLIC_` prefix for browser access

---

## What Happens After Fix

### Immediately
- ✅ Clarity script loads on all pages
- ✅ Session recordings start
- ✅ Heatmap data collection begins
- ✅ Behavior metrics tracked (dead clicks, rage clicks)

### After 1-2 Minutes
- ✅ First sessions visible in Clarity dashboard
- ✅ Can watch live session recordings

### After 1-2 Hours
- ✅ API endpoint returns real metrics
- ✅ Can analyze behavior patterns
- ✅ Heatmaps have enough data to be useful

### After 1-2 Days
- ✅ Meaningful insights about user behavior
- ✅ Can identify UX problems
- ✅ Can correlate with GA4 data

---

## Alternative: Load via GTM (No Code Changes)

If you prefer to manage all tracking via Google Tag Manager:

### In GTM Dashboard

1. Go to https://tagmanager.google.com/
2. Open container `GTM-WNG6Z9ZD`
3. Create new tag:
   - **Tag Type**: Custom HTML
   - **Tag Name**: Microsoft Clarity
   - **HTML**:
   ```html
   <script type="text/javascript">
     (function(c,l,a,r,i,t,y){
       c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
       t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
       y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
     })(window, document, "clarity", "script", "{{Clarity Project ID}}");
   </script>
   ```
4. Create variable:
   - **Variable Type**: Constant
   - **Name**: Clarity Project ID
   - **Value**: [Your Clarity Project ID]
5. Set trigger: **All Pages**
6. **Save** and **Publish**

**Pros**: Centralized tracking management
**Cons**: One more dependency on GTM

---

## Troubleshooting

### Issue: Still seeing "Not configured" error

**Check**:
```bash
# On production site, in browser console:
console.log(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID)
// Should show the project ID, not undefined
```

**If undefined**:
- Variable not set correctly in Vercel
- Need to redeploy after adding variable

### Issue: `initClarity()` not found

**Error**: `Cannot find module '@/lib/clarity/events'`

**Solution**: File path is correct, but verify import:
```typescript
import { initClarity } from '@/lib/clarity/events';
// NOT: import { initClarity } from 'lib/clarity/events';
```

### Issue: Script loads but no sessions in dashboard

**Possible causes**:
1. Ad blocker blocking Clarity (common)
2. Wrong Project ID
3. Need to wait 1-2 minutes
4. Privacy extensions blocking tracking

**Test without ad blocker**: Open incognito window without extensions

---

## Files to Update

1. **Vercel Environment Variables** (via dashboard or CLI)
   - Add: `NEXT_PUBLIC_CLARITY_PROJECT_ID`

2. **src/AnalyticsWrapper.tsx**
   - Add: `import { initClarity } from '@/lib/clarity/events';`
   - Add: `initClarity();` in useEffect

**That's it!** 2 changes total.

---

## Summary Checklist

- [ ] Add `NEXT_PUBLIC_CLARITY_PROJECT_ID` to Vercel
- [ ] Import `initClarity` in AnalyticsWrapper.tsx
- [ ] Call `initClarity()` in useEffect
- [ ] Commit and push changes
- [ ] Deploy to production
- [ ] Verify script loads (browser console)
- [ ] Check Clarity dashboard (after 1-2 min)
- [ ] Test API endpoint (after 1-2 hours)

**Time to implement**: ~5 minutes
**Time to see data**: 1-2 minutes after deployment

---

**Created**: November 4, 2025
**Status**: Ready to implement
**Priority**: Quick win - 5 min to enable valuable UX insights
