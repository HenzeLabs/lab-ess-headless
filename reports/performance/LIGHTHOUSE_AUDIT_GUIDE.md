# **Lighthouse Audit Guide - Manual Verification**

## **Server Status**
✅ Production build running at: **http://localhost:3000**

---

## **Step 1: Run Lighthouse Audit in Chrome DevTools**

### **Instructions:**
1. Open Chrome browser
2. Navigate to **http://localhost:3000**
3. Open DevTools (F12 or Cmd+Option+I)
4. Click **Lighthouse** tab
5. Configure:
   - **Mode:** Navigation (Default)
   - **Device:** Desktop (then run again for Mobile)
   - **Categories:** Performance only ✓
6. Click **"Analyze page load"**

---

## **Step 2: Expected Results**

### **Desktop Targets:**
```
Performance Score:   85-90%  ✓
LCP (Largest Contentful Paint):  < 2.5s   ✓
TBT (Total Blocking Time):       < 150ms  ✓
CLS (Cumulative Layout Shift):   0        ✓
FCP (First Contentful Paint):    < 1.8s   ✓
SI (Speed Index):                < 3.4s   ✓
TTI (Time to Interactive):       < 3.8s   ✓
```

### **Mobile Targets:**
```
Performance Score:   80-85%  ✓
LCP:                 < 3.5s  ✓
TBT:                 < 300ms ✓
CLS:                 0       ✓
```

---

## **Step 3: Export Report**

### **Save JSON Report:**
1. After Lighthouse completes, click the **gear icon** (⚙️)
2. Select **"Save as JSON"**
3. Save to: `/reports/performance/lighthouse-desktop-YYYYMMDD.json`

### **Save HTML Report:**
1. Click **"View Treemap"** → Download
2. Or click the **download icon** in Lighthouse panel
3. Save to: `/reports/performance/lighthouse-desktop-YYYYMMDD.html`

### **Repeat for Mobile:**
- Change Device to **Mobile**
- Save as: `lighthouse-mobile-YYYYMMDD.json`

---

## **Step 4: Validate Key Metrics**

### **Checklist:**
- [ ] Performance Score ≥ 85%
- [ ] LCP < 2.5s (desktop) or < 3.5s (mobile)
- [ ] TBT < 150ms (desktop) or < 300ms (mobile)
- [ ] CLS = 0
- [ ] No major accessibility warnings
- [ ] No console errors

---

## **Step 5: Record Results**

Create a file: `/reports/performance/results-YYYYMMDD.md`

```markdown
# Lighthouse Audit Results - [DATE]

## Desktop
- Performance Score: XX%
- LCP: X.XXs
- TBT: XXXms
- CLS: 0
- FCP: X.XXs
- SI: X.XXs
- TTI: X.XXs

## Mobile
- Performance Score: XX%
- LCP: X.XXs
- TBT: XXXms
- CLS: 0

## Changes Since Last Audit
- Phase 1: Removed dead code, fonts optimization
- Phase 2: Service Worker, AVIF images
- Phase 3: Preconnects, lazy loading, idle callbacks

## Next Steps
- [ ] Deploy to staging
- [ ] Run Lighthouse CI
- [ ] Integrate UX components
```

---

## **Troubleshooting**

### **If Score < 85%:**
1. Check Network tab for slow resources
2. Verify Service Worker is active (Application tab)
3. Check for JavaScript errors in Console
4. Confirm hero.avif is being used (not hero.jpg)
5. Verify preconnects are in DOM (`<head>` section)

### **If LCP > 2.5s:**
1. Check if hero image has `fetchPriority="high"`
2. Verify AVIF format is loaded (not JPG)
3. Check for blocking scripts in `<head>`
4. Confirm fonts are preconnected

### **If TBT > 150ms:**
1. Check for long tasks in Performance tab
2. Verify analytics loads with `requestIdleCallback`
3. Check for synchronous third-party scripts
4. Confirm below-fold components are lazy loaded

---

## **Lighthouse CI (Automated)**

### **Run from CLI:**
```bash
# Make sure server is running
npm run build && npm start &

# Wait 5 seconds for server to start
sleep 5

# Run Lighthouse CI
npx lhci autorun --config=lighthouserc.json

# Results will be in .lighthouseci/ directory
```

### **Expected Output:**
```
✓ Performance score ≥ 85%
✓ LCP ≤ 2500ms
✓ TBT ≤ 300ms
✓ CLS ≤ 0.1
```

---

## **Next Steps After Verification**

1. ✅ Lighthouse score confirmed
2. → Commit and push to staging
3. → Deploy staging environment
4. → Run full Playwright test suite
5. → Monitor real user metrics in GA4
