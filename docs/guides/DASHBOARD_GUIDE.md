# 📊 Lab Essentials Dashboard Guide

**Quick reference for accessing and using your dashboards**

---

## 🌐 How to Access Your Dashboards

### Local Development (Available Now)

```bash
# Start dev server
npm run dev

# Open in browser:
http://localhost:3001/admin/config   # Configuration Dashboard
http://localhost:3001/admin/metrics  # Metrics Dashboard
```

### Production (After Deployment)

```bash
# Once deployed to production:
https://labessentials.com/admin/config   # Configuration Dashboard
https://labessentials.com/admin/metrics  # Metrics Dashboard
```

---

## 📋 Admin Configuration Dashboard

**URL:** `http://localhost:3001/admin/config`

### What You'll See

```
┌─────────────────────────────────────────────────────────────┐
│  Lab Essentials Admin                                        │
│  Configuration Management System                             │
│                                                              │
│  [Configurations] [Metrics] [Back to Site]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Configuration Management                                    │
│  ─────────────────────────────────────────────────────────  │
│  [🔍 Search configurations...]                              │
│                                                              │
│  Filter: [All] [SEO] [Security] [Other]                    │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  ☐ Key                Value        Category  Updated  Actions│
│  ☐ seo.siteName      Lab Ess...   SEO       Oct 29   [✏️][📜][��️]│
│  ☐ seo.metaDesc      Best...      SEO       Oct 28   [✏️][📜][🗑️]│
│  ☐ seo.ogImage       /images...   SEO       Oct 27   [✏️][📜][🗑️]│
│  ☐ security.cors     https://...  Security  Oct 26   [✏️][📜][🗑️]│
│  ...                                                         │
│                                                              │
│  [< Previous] Page 1 of 1 [Next >]                          │
│                                                              │
│  Selected: 0 items                                          │
└─────────────────────────────────────────────────────────────┘
```

### Features

#### 1. **Category Filters**
- Click **SEO** → Shows only SEO parameters (8 items)
- Click **Security** → Shows only Security parameters (12 items)
- Click **Other** → Shows miscellaneous parameters
- Click **All** → Shows all 20 parameters

#### 2. **Search**
- Type in search box to filter by key, value, or category
- Real-time filtering as you type
- Example: Search "meta" shows all meta-related configs

#### 3. **Edit Configuration** (✏️ Button)
Click Edit to open modal:

```
┌────────────────────────────────────┐
│  Edit Configuration                │
│  ────────────────────────────────  │
│                                    │
│  Key: seo.siteName                 │
│  [─────────────────────────────]   │
│  (Read-only)                       │
│                                    │
│  Value:                            │
│  [Lab Essentials              ]   │
│                                    │
│  Updated By:                       │
│  [admin                       ]   │
│                                    │
│  [Cancel]  [Save] (Cmd+Enter)     │
└────────────────────────────────────┘
```

**To Edit:**
1. Click ✏️ Edit button
2. Modify the **Value** field
3. Enter your name in **Updated By**
4. Click **Save** (or press Cmd+Enter)
5. Watch for green toast: "✅ Configuration updated successfully"

#### 4. **Version History** (📜 Button)
Click History to open drawer:

```
┌─────────────────────────────────────────────────────────┐
│ History for seo.siteName                           [X]  │
│ ─────────────────────────────────────────────────────── │
│                                                          │
│ Version 3 • Oct 29, 2025 10:30 AM                      │
│ By: admin                                               │
│ Commit: abc1234                                         │
│                                                          │
│ Change:                                                  │
│ - Lab Essentials                                        │
│ + Lab Essentials - Your Science Partner                │
│                                                          │
│ [Revert to Version 3]                                   │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│                                                          │
│ Version 2 • Oct 28, 2025 2:15 PM                       │
│ By: lauren                                              │
│ Commit: def5678                                         │
│                                                          │
│ Change:                                                  │
│ - Lab Essentials LLC                                    │
│ + Lab Essentials                                        │
│                                                          │
│ [Revert to Version 2]                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Shows all historical versions
- Color-coded diff (red = old, green = new)
- Git commit hash and message
- One-click revert to any previous version

#### 5. **Bulk Operations**
Select multiple rows:

```
┌─────────────────────────────────────────────────────────┐
│ ✅ 3 items selected                                      │
│ [Export CSV] [Delete Selected] [Clear Selection]       │
└─────────────────────────────────────────────────────────┘
```

**To Use:**
1. Check boxes next to parameters
2. Click **Export CSV** → Downloads `config_export_2025-10-29.csv`
3. Or click **Delete Selected** → Confirms before deleting

---

## 📈 Metrics Dashboard

**URL:** `http://localhost:3001/admin/metrics`

### What You'll See

```
┌─────────────────────────────────────────────────────────────┐
│  Lab Essentials Admin                                        │
│  Configuration Management System                             │
│                                                              │
│  [Configurations] [Metrics] [Back to Site]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Analytics Metrics                                           │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Date Range: [7 Days] [30 Days] [90 Days]                  │
│                                                              │
│  Real-time: ● 12 active users                               │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 🎯 Sessions│ │ 📊 Conv.  │ │ ⏱️  Bounce │ │ 📈 Scroll │     │
│  │   12,450   │ │   3.2%   │ │   42.1%  │ │   68%    │     │
│  │ ↑ +8.3%   │ │ ↑ +12%   │ │ ↓ -2.1%  │ │ ↑ +5%    │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📈 Impact Since Last Config Change                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Measuring effect of seo.siteName                    │   │
│  │ Changed Oct 29, 2025 • 7-day comparison            │   │
│  │                                                      │   │
│  │ Page Views: +12.3% ████████████░░░░                │   │
│  │ Sessions:   +8.7%  ██████████░░░░░░                │   │
│  │ Bounce Rate: -2.1% ████░░░░░░░░░░░░                │   │
│  │                                                      │   │
│  │ ✅ Positive impact detected - configuration change  │   │
│  │    improved metrics                                  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🖱️ User Behavior Highlights                               │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Dead Clicks:   1.2%  ✅ Excellent                   │   │
│  │ Rage Clicks:   0.3%  ✅ Excellent                   │   │
│  │ Quick Backs:   2.1%  ⚠️  Good                       │   │
│  │ Scroll Depth:  68%   ████████████░░░░              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📊 Sessions & Users (Last 7 Days)                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 12k │                        ╱╲                     │   │
│  │     │                     ╱╲ ╱  ╲                   │   │
│  │ 10k │                  ╱╲╱  ╲╱    ╲                 │   │
│  │     │                ╱╲              ╲               │   │
│  │ 8k  │             ╱╲╱                 ╲╱            │   │
│  │     │          ╱╲╱                       ╲          │   │
│  │ 6k  │       ╱╲╱                           ╲╱        │   │
│  │     └─────┴─────┴─────┴─────┴─────┴─────┴─────     │   │
│  │     Oct 22  23   24   25   26   27   28   29      │   │
│  │     ─ Sessions  ─ Users                             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🎯 Conversion Funnel                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Sessions       ████████████████████████ 12,450     │   │
│  │ Add to Cart    ████████░░░░░░░░░░░░░░░   1,868     │   │
│  │ Checkout       ████░░░░░░░░░░░░░░░░░░░     996     │   │
│  │ Conversions    ██░░░░░░░░░░░░░░░░░░░░░     398     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Features

#### 1. **KPI Cards**
- **Sessions:** Total visits in selected period
- **Conversions:** Conversion rate (%)
- **Bounce Rate:** Percentage of single-page sessions
- **Scroll Depth:** Average page scroll percentage
- Each card shows trend vs previous period (↑ or ↓)

#### 2. **Real-time Users**
- Live count of currently active users
- Pulse animation indicates real-time data
- Updates automatically

#### 3. **Config Impact Widget**
- Shows most recent configuration change
- Before/after metrics comparison (7 days each side)
- Visual progress bars for each metric
- Automated recommendation based on impact

**Note:** Requires 24 hours of data after a config change to show accurate deltas.

#### 4. **Behavior Highlights**
- **Dead Clicks:** Clicks on non-interactive elements
- **Rage Clicks:** Rapid repeated clicks (user frustration)
- **Quick Backs:** Users immediately hitting back button
- **Scroll Depth:** How far users scroll down pages

**Health Status:**
- ✅ **Excellent** (Green): Low issue rate
- ⚠️ **Good** (Yellow): Moderate issue rate
- 🔴 **Needs Attention** (Red): High issue rate

#### 5. **Sessions Chart**
- Interactive area chart with 7-day trend
- Two data series: Sessions (blue) and Users (purple)
- Hover over any point to see exact values
- Gradient fill for visual appeal

#### 6. **Conversion Funnel**
- Horizontal bar chart showing user journey
- 4 stages: Sessions → Add to Cart → Checkout → Conversions
- Percentages show conversion rate at each stage
- Helps identify drop-off points

#### 7. **Date Range Selector**
- **7 Days:** Last week of data
- **30 Days:** Last month of data
- **90 Days:** Last quarter of data
- Click any button to update all charts

---

## 🎮 Try These Actions

### On Admin Config Dashboard:

1. **Edit a Configuration:**
   - Go to `http://localhost:3001/admin/config`
   - Click ✏️ on `seo.siteName`
   - Change to: `Lab Essentials - Your Science Partner`
   - Click **Save**
   - Watch for green toast ✅

2. **View History:**
   - Click 📜 **History** on same row
   - See your change appear as newest version
   - Check the diff (old → new)
   - Try clicking **Revert** (optional)

3. **Export Data:**
   - Check 2-3 checkboxes
   - Click **Export CSV**
   - Open downloaded file in Excel/Sheets

4. **Search & Filter:**
   - Click **SEO** filter → See only SEO params
   - Type "meta" in search → See filtered results

### On Metrics Dashboard:

1. **Explore KPIs:**
   - Go to `http://localhost:3001/admin/metrics`
   - Look at 4 KPI cards
   - Note the trend arrows (↑ or ↓)

2. **Check Config Impact:**
   - Find "Impact Since Last Config Change" widget
   - See which config was changed recently
   - View before/after metrics

3. **Interact with Charts:**
   - Hover over Sessions chart → See tooltips
   - Hover over Conversion funnel → See details

4. **Change Date Range:**
   - Click **30 Days** button
   - Watch charts update
   - Try **90 Days**

---

## 🔧 Configuration Details

### All 20 Parameters Available:

**SEO Parameters (8):**
1. `seo.siteName` - Site name for title tags
2. `seo.metaDescription` - Default meta description
3. `seo.ogImage` - Default Open Graph image
4. `seo.twitterHandle` - Twitter @username
5. `seo.canonicalUrl` - Base canonical URL
6. `seo.keywords` - Meta keywords
7. `seo.author` - Content author
8. `seo.locale` - Site locale (e.g., en_US)

**Security Parameters (12):**
1. `security.corsOrigins` - Allowed CORS origins
2. `security.rateLimit` - API rate limit (requests/min)
3. `security.allowedDomains` - Whitelisted domains
4. `security.maxUploadSize` - Max file upload size (MB)
5. `security.sessionTimeout` - Session timeout (minutes)
6. `security.csrfEnabled` - CSRF protection on/off
7. `security.httpsOnly` - Force HTTPS
8. `security.contentSecurityPolicy` - CSP header
9. `security.allowedIPs` - IP whitelist
10. `security.twoFactorEnabled` - 2FA requirement
11. `security.passwordMinLength` - Min password length
12. `security.passwordRequireSpecial` - Special char requirement

---

## 📱 Mobile View

Both dashboards are **fully responsive**:

- **Desktop:** Full table view with all columns
- **Tablet:** Stacked layout, horizontal scroll
- **Mobile:** Card-based layout, vertical stack

Try resizing your browser window to see responsive design!

---

## 🎨 UI Features

### Color Coding:
- **Green (✅):** Success, positive trends, excellent status
- **Yellow (⚠️):** Warning, moderate status
- **Red (🔴/❌):** Error, negative trends, needs attention
- **Blue (📊):** Information, neutral
- **Purple (🎯):** Special metrics

### Icons:
- 🎯 Sessions
- 📊 Conversions
- ⏱️ Bounce Rate
- 📈 Scroll Depth
- ✏️ Edit
- 📜 History
- 🗑️ Delete
- 🖱️ User Behavior
- ● Real-time indicator

### Animations:
- Toast notifications slide in from right
- History drawer slides in from right
- Modal fades in with backdrop
- Loading skeletons pulse
- Real-time users pulse
- Charts animate on load

---

## 🆘 Troubleshooting

**Q: Dashboard shows 404**
**A:** Make sure dev server is running: `npm run dev`

**Q: Changes don't save**
**A:** Check browser console (F12) for errors. Verify CONFIG_ADMIN_TOKEN is set.

**Q: Metrics show "Not configured"**
**A:** Normal! GA4/Clarity need to be set up in production. Dashboard shows demo data for now.

**Q: Charts not rendering**
**A:** Refresh page. Check browser console for JavaScript errors.

**Q: Can't see History**
**A:** Ensure git is initialized and commits exist: `git log data/config_store/config.csv`

---

## 📚 Next Steps

1. **Explore locally** (now): Play with all features on `localhost:3001`
2. **Deploy to production**: Follow [DEPLOYMENT_VERIFICATION.md](DEPLOYMENT_VERIFICATION.md)
3. **Set up analytics**: Add GA4 and Clarity credentials
4. **Configure automation**: Set up weekly emails
5. **Monitor metrics**: Check impact of config changes

---

## 🔗 Quick Links

- **Config Dashboard:** http://localhost:3001/admin/config
- **Metrics Dashboard:** http://localhost:3001/admin/metrics
- **Main Site:** http://localhost:3001/
- **API Docs:** [QUICK_COMMANDS.md](QUICK_COMMANDS.md)
- **Deployment Guide:** [DEPLOYMENT_VERIFICATION.md](DEPLOYMENT_VERIFICATION.md)

---

**Enjoy exploring your dashboards!** 🚀
