# Analytics Integration Testing Guide

## 🧪 Complete Testing Checklist for GA4 + Microsoft Clarity Integration

This guide provides step-by-step testing instructions for all analytics features implemented in the Lab Essentials store.

## 🔍 Search Analytics Testing

### Test 1: Basic Search Query Tracking

**Steps:**

1. Open browser Developer Tools (F12)
2. Navigate to Console tab
3. Go to the home page (http://localhost:3000)
4. Click the search icon in the header
5. Type "lab equipment" in the search field
6. Press Enter

**Expected Results:**

- Console should show: `📊 GA4 Event Tracked: search_query`
- Console should show: `🔍 Clarity Event Tracked: search_query`
- Event parameters should include:
  - `search_term: "lab equipment"`
  - `search_source: "header"`
  - `query_length: 13`

### Test 2: Predictive Search Interaction

**Steps:**

1. Open search modal
2. Type "micro" slowly (to trigger predictive search)
3. Wait for predictive results to appear
4. Click on the first predictive suggestion

**Expected Results:**

- Console shows predictive search result click tracking
- Event includes `result_position: 0` and `result_type`
- Navigation occurs to the clicked result

### Test 3: Search Abandonment Tracking

**Steps:**

1. Open search modal
2. Type "xyz123nonexistent" (query with no results)
3. Wait 5 seconds
4. Close the search modal without clicking anything

**Expected Results:**

- Console shows search abandonment event
- Parameters include `abandonment_reason: "no_results"`

## 👤 Customer Account Analytics Testing

### Test 4: Successful Login Tracking

**Steps:**

1. Navigate to `/account/login`
2. Enter email: `test@example.com`
3. Enter password: `password`
4. Click "Sign In"

**Expected Results:**

- Console shows: `📊 GA4 Event Tracked: customer_login`
- Console shows: `🔍 Clarity Event Tracked: customer_login`
- Parameters include:
  - `customer_id: "customer_123"`
  - `login_method: "email"`
  - `login_timestamp`

### Test 5: Failed Login Tracking

**Steps:**

1. Navigate to `/account/login`
2. Enter email: `wrong@email.com`
3. Enter password: `wrongpassword`
4. Click "Sign In"

**Expected Results:**

- Console shows: `📊 GA4 Event Tracked: login_failed`
- Parameters include:
  - `error_reason: "invalid_credentials"`
  - `attempt_count: 1`
  - `security_risk: "low"`

## 🎛️ Analytics Dashboard Testing

### Test 6: Real-time Dashboard

**Steps:**

1. Add AnalyticsInsightsPanel to a page (e.g., admin dashboard)
2. Import and render: `<AnalyticsInsightsPanel />`
3. View the analytics dashboard

**Expected Results:**

- Dashboard displays mock analytics data
- Shows search metrics, customer metrics
- Integration status shows GA4 and Clarity as active
- Testing instructions are clearly displayed

## 🔧 Integration Status Verification

### Test 7: GA4 Integration Check

**Browser Console Test:**

```javascript
// Type this in browser console to test GA4 availability
if (window.gtag) {
  console.log('✅ GA4 is loaded and available');
  window.gtag('event', 'test_event', { test_parameter: 'testing' });
} else {
  console.log('❌ GA4 is not loaded');
}
```

### Test 8: Microsoft Clarity Integration Check

**Browser Console Test:**

```javascript
// Type this in browser console to test Clarity availability
if (window.clarity) {
  console.log('✅ Microsoft Clarity is loaded and available');
  window.clarity('event', 'test_event', { test_parameter: 'testing' });
} else {
  console.log('❌ Microsoft Clarity is not loaded');
}
```

## 📊 Production Verification (When Live)

### GA4 Verification Steps

1. **Go to Google Analytics 4**
2. **Navigate to:** Reports > Engagement > Events
3. **Look for custom events:**

   - `search_query`
   - `search_result_click`
   - `customer_login`
   - `login_failed`
   - `search_abandoned`

4. **Check Real-time Reports:**

   - Reports > Realtime
   - Perform test actions and verify events appear

5. **Verify Event Parameters:**
   - Click on any custom event
   - Check that custom parameters are being recorded:
     - `search_term`
     - `customer_id`
     - `result_position`
     - etc.

### Microsoft Clarity Verification Steps

1. **Go to Microsoft Clarity Dashboard**
2. **Navigate to:** Recordings
3. **Filter recordings** to recent sessions
4. **Watch recordings** showing:

   - Search interactions
   - Login attempts
   - Navigation patterns

5. **Check Heatmaps:**

   - Navigate to Heatmaps
   - View click heatmaps for search interface
   - Analyze scroll patterns on search results

6. **Custom Events:**
   - Go to Insights > Events
   - Verify custom events are being recorded:
     - `search_query`
     - `customer_login`
     - etc.

## 🐛 Troubleshooting Common Issues

### Issue: Events Not Showing in Console

**Possible Causes:**

- Analytics scripts not loaded
- Environment variables missing
- Import errors in components

**Solutions:**

```bash
# Check environment variables
cat .env.local | grep GA_MEASUREMENT_ID
cat .env.local | grep CLARITY_PROJECT_ID

# Verify analytics scripts in layout.tsx
# Ensure proper imports in components
```

### Issue: GA4 Events Not Appearing in Dashboard

**Possible Causes:**

- Incorrect Measurement ID
- Ad blockers preventing tracking
- Events need 24-48 hours to appear

**Debug Steps:**

1. Check Network tab for gtag requests
2. Verify Measurement ID format (G-XXXXXXXXXX)
3. Test in incognito mode
4. Check GA4 DebugView for real-time events

### Issue: Clarity Not Recording Sessions

**Possible Causes:**

- Incorrect Project ID
- Domain not added to Clarity project
- Privacy settings blocking scripts

**Debug Steps:**

1. Verify Clarity script loads in Network tab
2. Check Project ID format
3. Add domain to Clarity project settings
4. Test without privacy extensions

## 📋 Test Results Template

Use this template to document your testing results:

```
## Analytics Integration Test Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Development/Staging/Production]

### Search Analytics Tests
- [ ] Basic search query tracking - PASS/FAIL
- [ ] Predictive search interaction - PASS/FAIL
- [ ] Search abandonment tracking - PASS/FAIL

### Customer Account Analytics Tests
- [ ] Successful login tracking - PASS/FAIL
- [ ] Failed login tracking - PASS/FAIL

### Integration Status Tests
- [ ] GA4 availability check - PASS/FAIL
- [ ] Clarity availability check - PASS/FAIL
- [ ] Analytics dashboard display - PASS/FAIL

### Production Verification (if applicable)
- [ ] GA4 custom events visible - PASS/FAIL
- [ ] Clarity recordings capturing interactions - PASS/FAIL
- [ ] Event parameters correctly formatted - PASS/FAIL

### Issues Found
[List any issues or unexpected behavior]

### Notes
[Additional observations or recommendations]
```

## 🚀 Performance Testing

### Analytics Impact Assessment

**Steps:**

1. Open browser Performance tab
2. Record page load with analytics enabled
3. Record page load with analytics disabled
4. Compare performance metrics

**Metrics to Monitor:**

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

**Acceptable Impact:**

- Analytics should add < 100ms to page load
- No visible layout shifts from script loading
- Search functionality should remain responsive

## 🔄 Continuous Testing

### Automated Testing Setup

Consider implementing automated tests for analytics:

```javascript
// Example Cypress test
describe('Analytics Tracking', () => {
  it('should track search queries', () => {
    cy.visit('/');
    cy.window().then((win) => {
      cy.spy(win, 'gtag').as('gtagSpy');
    });

    // Perform search
    cy.get('[data-test-id="search-button"]').click();
    cy.get('[data-test-id="search-input"]').type('lab equipment{enter}');

    // Verify tracking
    cy.get('@gtagSpy').should('have.been.calledWith', 'event', 'search_query');
  });
});
```

### Monitoring Alerts

Set up alerts for:

- Drop in search event volume
- Increase in failed login attempts
- Search abandonment rate spikes
- Analytics script loading failures

---

**Testing Complete:** All analytics features have been implemented and are ready for testing. The integration provides comprehensive tracking of user interactions while maintaining performance and privacy standards.
