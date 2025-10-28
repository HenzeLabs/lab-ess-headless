# Microsoft Clarity GTM Setup Guide

**Date:** 2025-10-27
**Clarity Project ID:** m5xby3pax0
**GTM Container:** GTM-WNG6Z9ZD

---

## 🎯 Issue

Microsoft Clarity is showing 0 sessions because the Clarity script is not loading on your website.

**Root Cause:**
- ✅ Clarity project exists: m5xby3pax0
- ✅ "Microsoft Clarity – Custom" tag exists in GTM (correct implementation)
- ❌ "Microsoft Clarity – Official" tag is **PAUSED** (gallery template - not firing)
- ❌ "Microsoft Clarity – Custom" tag **NOT YET PUBLISHED**
- ❌ window.clarity returns undefined

**The Problem:**
You have TWO Clarity tags in GTM:
1. **"Microsoft Clarity – Official"** (Gallery Template) → **PAUSED** ❌
2. **"Microsoft Clarity – Custom"** (Custom HTML) → **Correct but UNPUBLISHED** ⚠️

---

## ✅ Solution: Publish Your Custom Tag & Remove/Pause Official Tag

### Step 1: Log into Google Tag Manager

1. Go to: https://tagmanager.google.com/
2. Select container: **GTM-WNG6Z9ZD**
3. Click **"Tags"** in the left sidebar

### Step 2: Handle Existing Tags

**Option A: Delete the Official Tag (Recommended)**
1. Find tag: **"Microsoft Clarity – Official"**
2. Click the tag name
3. Click **"Delete"** (top right)
4. Confirm deletion

**Option B: Keep it Paused (if you want to keep for reference)**
1. The "Microsoft Clarity – Official" tag is already paused
2. Leave it paused (it won't interfere)

### Step 3: Verify Your Custom Tag Configuration

1. Find tag: **"Microsoft Clarity – Custom"** (or similar name)
2. Click to open it
3. **Verify the configuration matches below:**

**Tag Type:** Custom HTML

**HTML Code (verify this matches):**
```html
<script type="text/javascript">
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "m5xby3pax0");
</script>
```

**Trigger:** All Pages ✅

4. If everything looks correct, click **"Save"** (if you made any changes)

### Step 4: Submit & Publish (THE CRITICAL STEP)

**This is what's missing - your tag exists but isn't published yet!**

1. Click **"Submit"** (top right in GTM workspace - big blue button)
2. **Version Configuration:**
   - **Version Name:** `Publish Microsoft Clarity Custom Tag`
   - **Version Description:** `Publishing custom Clarity tag (m5xby3pax0). Removed/paused old Official tag.`
3. Click **"Publish"** (blue button)
4. **Wait 2-3 minutes** for changes to propagate to production

---

## 🧪 Verification Steps

### 1. Browser Console Test (2 minutes)

Open https://store.labessentials.com and open browser console (F12):

```javascript
// Wait 5 seconds for Clarity to load, then run:
window.clarity
// Expected: ƒ () { ... } (function)
// If undefined: Wait another 5 seconds and try again

// Check if Clarity is queuing events:
window.clarity.q
// Expected: Array (may be empty or have items)
```

### 2. Network Tab Test (2 minutes)

1. Open Chrome DevTools → **Network** tab
2. Filter by: `clarity`
3. Reload the page
4. **Look for:**
   - ✅ `https://www.clarity.ms/tag/m5xby3pax0` (HTTP 200)
   - ✅ Clarity collect endpoints (`/collect` requests)

**Screenshot what you should see:**
```
clarity.ms/tag/m5xby3pax0    script    200    ~50KB
clarity.ms/collect           xhr       200    <1KB
```

### 3. GTM Preview Mode Test (3 minutes)

1. In GTM, click **"Preview"** (top right)
2. Enter your site URL: https://store.labessentials.com
3. **Verify Tag Fires:**
   - "Microsoft Clarity – Base Script" should show **"Fired"** on page load
   - Should fire on **"Page View - DOM Ready"** trigger

### 4. Clarity Dashboard Test (5-10 minutes)

**Note:** Clarity data can take 5-10 minutes to appear

1. Go to: https://clarity.microsoft.com/projects/view/m5xby3pax0
2. Click **"Dashboard"** or **"Recordings"**
3. **Expected Results:**
   - Live users count should increase
   - New sessions should appear
   - Recordings should start capturing

If no data after 10 minutes:
- Verify domain is correct in Clarity project settings
- Check that tag fired in GTM Preview mode
- Confirm `window.clarity` returns a function

---

## 📊 Expected Results After Fix

### Clarity Dashboard Should Show:

**Metrics:**
- ✅ Sessions: Active sessions appearing
- ✅ Pages per session: Average metrics
- ✅ Scroll depth: User engagement data
- ✅ Active time spent: Session duration
- ✅ Live users: Real-time visitor count

**Features Working:**
- ✅ Session recordings
- ✅ Heatmaps
- ✅ Rage clicks detection
- ✅ Dead clicks detection
- ✅ Excessive scrolling insights
- ✅ Quick backs tracking

---

## 🔧 Troubleshooting

### Issue: Two Clarity Tags in GTM (Your Current Situation)

**Problem:**
- "Microsoft Clarity – Official" (Gallery Template) → Paused
- "Microsoft Clarity – Custom" (Custom HTML) → Unpublished

**This causes:**
- Neither tag fires
- window.clarity = undefined
- 0 sessions in Clarity dashboard

**Fix:**
1. **Delete or keep paused** the "Official" tag
2. **Verify** your "Custom" tag has:
   - Correct script with project ID: m5xby3pax0
   - Trigger: All Pages
3. **Publish** the GTM container (Submit → Publish)
4. **Wait 2-3 minutes** for changes to take effect

### Issue: window.clarity is undefined (After Publishing)

**Causes:**
1. GTM container not published (most common!)
2. Tag not firing (check GTM Preview mode)
3. Browser cache (hard refresh: Cmd+Shift+R)
4. Browser extension blocking Clarity

**Fix:**
- **Verify tag published in GTM** (check Versions tab)
- Check GTM Preview mode shows "Microsoft Clarity – Custom" firing
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
- Test in incognito mode (disables extensions)

### Issue: Tag fires but no data in Clarity

**Causes:**
1. Wrong project ID
2. Domain not allowed in Clarity project settings
3. Adblocker or privacy tools blocking

**Fix:**
- Verify project ID: m5xby3pax0
- In Clarity dashboard, go to Settings → Allowed domains
- Add: `store.labessentials.com` and `labessentials.com`
- Test in incognito with adblockers disabled

### Issue: Data delayed

**This is normal:**
- Clarity can take 5-10 minutes to show data
- Recordings process in batches
- Live users update every 1-2 minutes

---

## 📋 Current Analytics Stack (After Fix)

| Platform | ID | Load Method | Status |
|----------|-----|-------------|---------|
| **GTM** | GTM-WNG6Z9ZD | Direct script | ✅ Active |
| **GA4** | G-QCSHJ4TDMY | Via GTM | ✅ Active |
| **Reddit** | a2_hwuo2umsdjch | Via GTM | ✅ Active |
| **Taboola** | Official Tag | Via GTM | ✅ Active |
| **Meta Pixel** | - | Via GTM | ✅ Active |
| **Clarity** | m5xby3pax0 | Via GTM | ⚠️ **Needs Adding** |

---

## 🎯 Integration with Existing Code

Your codebase already has Clarity integration code in:
- [src/lib/analytics-tracking.ts](../src/lib/analytics-tracking.ts) - `trackClarityEvent()` function
- [src/types/analytics.d.ts](../src/types/analytics.d.ts) - TypeScript definitions
- [src/components/header/Search.tsx](../src/components/header/Search.tsx) - Custom search events

**Once Clarity loads via GTM, these will automatically work:**

```typescript
// Example: Search tracking will automatically send to Clarity
if (typeof window !== 'undefined' && window.clarity) {
  window.clarity('event', 'search_performed', {
    search_term: query,
    results_count: results.length
  });
}
```

---

## ✅ Success Criteria

After adding Clarity to GTM, you should see:

- [x] `window.clarity` returns a function
- [x] Network requests to `clarity.ms` return HTTP 200
- [x] GTM Preview shows "Microsoft Clarity – Base Script" firing
- [x] Clarity dashboard shows live sessions within 10 minutes
- [x] Session recordings start capturing
- [x] Heatmaps generate data
- [x] Custom events from code appear in Clarity

---

## 🔗 Quick Links

- **Clarity Dashboard:** https://clarity.microsoft.com/projects/view/m5xby3pax0
- **GTM Container:** https://tagmanager.google.com/
- **GTM Container ID:** GTM-WNG6Z9ZD
- **Clarity Project ID:** m5xby3pax0

---

## 📝 Notes

**Why GTM vs Direct Code?**
- ✅ Centralized management (all analytics in one place)
- ✅ No code changes needed
- ✅ Easy to enable/disable without deployments
- ✅ Matches your existing analytics setup
- ✅ GTM Preview mode for testing

**When Will Data Appear?**
- Live users: 1-2 minutes
- Session recordings: 5-10 minutes
- Heatmaps: After 100+ sessions
- Insights: After 1,000+ sessions

---

**Created:** 2025-10-27
**Status:** Awaiting Manual GTM Configuration
**Next Action:** Add Clarity tag to GTM following steps above
