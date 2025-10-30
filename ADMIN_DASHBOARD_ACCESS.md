# 🔐 Admin Dashboard Access Guide

Quick reference for accessing your Lab Essentials admin dashboards.

---

## 📊 Analytics Metrics Dashboard

**View real-time GA4 data, conversion funnels, and behavior insights**

### Access
- **URL:** https://store.labessentials.com/admin/metrics
- **Authentication:** Basic Auth
  - Username: (leave blank or type anything)
  - Password: `test123` (from `.env.local` → `ADMIN_PASSWORD`)

### What You'll See

#### KPI Cards
- **Sessions** - Total user sessions in selected date range
- **Conversions** - Completed purchases/goals
- **Bounce Rate** - % of single-page sessions
- **Scroll Depth** - Average page scroll percentage
- **Real-time Users** - Active users right now (live count with pulse animation)

#### Charts
- **Sessions Chart** - 7-day trend line showing traffic patterns
- **Conversion Funnel** - Step-by-step breakdown:
  - Page Views → Product Views → Add to Cart → Begin Checkout → Purchase

#### Configuration Impact Widget
Shows before/after metrics for your last configuration change:
- What changed and when
- Metrics comparison (7 days before vs 7 days after)
- Percent change indicators

#### Behavior Highlights (Microsoft Clarity)
- Dead clicks (clicked unresponsive elements)
- Rage clicks (frustrated rapid clicking)
- Quick backs (immediate navigation away)

#### Top Pages
List of most-viewed pages with traffic counts

### Date Range Selector
Switch between:
- Last 7 days (default)
- Last 30 days
- Last 90 days

---

## ⚙️ Configuration Dashboard

**Manage site settings, SEO, security configurations**

### Access
- **URL:** https://store.labessentials.com/admin/config
- **Authentication:** Basic Auth (same as metrics)
  - Password: `test123`

### What You'll See

#### Configuration Table
All 20+ site configuration parameters:
- **SEO Settings:** Site name, descriptions, meta tags
- **Security Settings:** CSP headers, rate limits, CORS
- **Feature Flags:** Toggle features on/off
- **Other Settings:** Analytics IDs, API keys, etc.

#### Features
- **Search & Filter** - Find configs by category or keyword
- **Inline Editor** - Click to edit any value
- **History Viewer** - See all changes with git diff viewer
- **Bulk Operations:**
  - Select multiple configs
  - Export to CSV
  - Delete selected
- **Validation** - Real-time input validation
- **Toast Notifications** - Instant feedback on actions

#### Version History
Every config change is automatically:
- Committed to git
- Timestamped
- Attributed to you
- Viewable with before/after diff

---

## 🔌 Direct API Access

### GA4 Metrics API
Fetch raw analytics data programmatically:

```bash
# Last 7 days
curl "https://store.labessentials.com/api/metrics/ga4?start=2025-10-23&end=2025-10-30"

# Custom date range
curl "https://store.labessentials.com/api/metrics/ga4?start=2025-10-01&end=2025-10-15"
```

**Response includes:**
- `pageViews` - Total page views
- `sessions` - Total sessions
- `users` - Unique users
- `bounceRate` - Bounce rate (0-1)
- `avgSessionDuration` - Average time (seconds)
- `conversionRate` - Conversion percentage
- `topPages[]` - Array of top pages with views and avg time

### Clarity Metrics API
```bash
curl "https://store.labessentials.com/api/metrics/clarity?start=2025-10-23&end=2025-10-30"
```

### Configuration API
```bash
# Get single config
curl "https://store.labessentials.com/api/config?key=seo.siteName"

# Get all configs
curl "https://store.labessentials.com/api/config?all=true"

# Update config (requires auth token)
curl -X PUT "https://store.labessentials.com/api/config" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"seo.siteName","value":"Lab Essentials"}'
```

---

## 📱 Mobile Access

Both dashboards are fully responsive and work on mobile devices. Use the same URLs and credentials.

---

## 🔒 Security Notes

### Current Password
- **Password:** `test123` (development/staging)
- **Set in:** `.env.local` → `ADMIN_PASSWORD`

### For Production
Change the password before going live:

1. **Generate secure password:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update `.env.local`:**
   ```bash
   ADMIN_PASSWORD=your_new_secure_password_here
   ```

3. **Set on Vercel:**
   - Go to: Vercel Dashboard → Project → Settings → Environment Variables
   - Add/update `ADMIN_PASSWORD` with new value
   - Redeploy

### Access Control
- Basic Auth protects both dashboards
- No public access without credentials
- HTTPS enforced on production
- Rate limiting enabled
- CSP headers prevent XSS attacks

---

## 🛠️ Troubleshooting

### "401 Unauthorized" Error
- Ensure you're entering the correct password: `test123`
- Try clearing browser cache and cookies
- Check if environment variable is set correctly

### "No Data Available"
- Verify GA4 is receiving data (check Google Analytics Realtime)
- Ensure service account credentials are configured
- Check date range isn't too far in the past
- Wait 24-48 hours for new property to collect data

### "API Error" Messages
- Check browser console for detailed error messages
- Verify environment variables are set on Vercel
- Check GA4 Property ID is correct: `G-7NR2JG1EDP`
- Ensure service account has Viewer role in GA4

---

## 📚 Related Documentation

- **[ANALYTICS_STATUS.md](ANALYTICS_STATUS.md)** - Complete analytics configuration status
- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - Production deployment checklist
- **[GA4_ALIGNMENT_GUIDE.md](docs/GA4_ALIGNMENT_GUIDE.md)** - GA4 setup guide
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Full deployment instructions

---

## 🎯 Quick Links

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| **Metrics** | https://store.labessentials.com/admin/metrics | View analytics, conversions, behavior |
| **Config** | https://store.labessentials.com/admin/config | Manage site settings |
| **GA4 API** | `/api/metrics/ga4?start=YYYY-MM-DD&end=YYYY-MM-DD` | Raw analytics data |
| **Clarity API** | `/api/metrics/clarity?start=YYYY-MM-DD&end=YYYY-MM-DD` | Behavior insights |
| **Config API** | `/api/config?key=KEY` or `?all=true` | Configuration values |

---

**Password:** `test123` (remember to change for production!)

**Last Updated:** October 30, 2025
