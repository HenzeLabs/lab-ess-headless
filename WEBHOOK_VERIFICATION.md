# Shopify Webhook Verification Guide

**Date:** October 31, 2025
**Webhook Endpoint:** `https://store.labessentials.com/api/webhooks/shopify/orders`

---

## Webhook Configuration

Your Shopify webhook handler is located at:
**File:** [src/app/api/webhooks/shopify/orders/route.ts](src/app/api/webhooks/shopify/orders/route.ts)

### What the Webhook Does

When Shopify sends an order webhook, your handler:

1. **Verifies authenticity** using HMAC-SHA256 signature
2. **Logs the order** with details (order ID, total, currency, item count)
3. **Sends to GA4** via Measurement Protocol (purchase event)
4. **Sends to Taboola** S2S Conversion API (purchase tracking)

### Expected Log Messages

When a webhook is successfully received, you should see these logs:

```
✅ Received Shopify order webhook: {
  orderId: 6107518533691,
  orderNumber: 1258,
  total: "20.16",
  currency: "USD",
  itemCount: 1
}
```

Then:
```
✅ Successfully sent purchase event to GA4: 1258
✅ Taboola S2S purchase tracked: 1258
```

### Error Log Messages

If there are issues, you'll see:

**Missing HMAC:**
```
❌ Missing HMAC header
```

**Invalid Signature:**
```
❌ Invalid webhook signature
```

**Missing Configuration:**
```
⚠️ GA4_MEASUREMENT_ID missing - skipping GA4 purchase tracking
⚠️ TABOOLA_ADVERTISER_ID not configured - skipping Taboola S2S tracking
```

---

## How to Check Webhook Delivery

### Method 1: Vercel Logs (Real-time)

```bash
npx vercel logs store.labessentials.com --scope=henzelabs-projects | grep -i "webhook"
```

Look for:
- `Received Shopify order webhook`
- `Successfully sent purchase event to GA4`
- `Taboola S2S purchase tracked`

### Method 2: Shopify Admin Dashboard

1. Go to: **Settings** → **Notifications** → **Webhooks**
2. Find the webhook: `Order creation` → `https://store.labessentials.com/api/webhooks/shopify/orders`
3. Click on it to see recent deliveries
4. Check the **Response status**:
   - ✅ `200 OK` = Working correctly
   - ❌ `401 Unauthorized` = HMAC signature issue
   - ❌ `500 Server Error` = Processing error

### Method 3: Test with Recent Order

If you've had recent orders, check for their order numbers in the logs:

```bash
npx vercel logs store.labessentials.com --scope=henzelabs-projects | grep -E "order.*1258|webhook.*1258"
```

Replace `1258` with an actual order number from your store.

---

## Required Environment Variables

For the webhook to work fully, these must be set on Vercel:

| Variable | Purpose | Status |
|----------|---------|--------|
| `SHOPIFY_WEBHOOK_SECRET` | Verify webhook authenticity | ✅ Set (11d ago) |
| `GA4_MEASUREMENT_ID` | Send purchase to GA4 | ✅ Set (G-7NR2JG1EDP) |
| `GA4_MEASUREMENT_PROTOCOL_SECRET` | GA4 API authentication | ❓ Check if set |
| `TABOOLA_ADVERTISER_ID` | Taboola conversion tracking | ❓ Check if set |

### Check Environment Variables

```bash
npx vercel env ls production --scope=henzelabs-projects | grep -E "GA4_MEASUREMENT|TABOOLA|WEBHOOK"
```

---

## Webhook Setup in Shopify Admin

If webhooks aren't configured yet, here's how to set them up:

### Step 1: Create Webhook

1. Log in to Shopify Admin: https://labessentials.myshopify.com/admin
2. Go to: **Settings** → **Notifications** → **Webhooks**
3. Click **Create webhook**

### Step 2: Configure Webhook

- **Event:** `Order creation`
- **Format:** `JSON`
- **URL:** `https://store.labessentials.com/api/webhooks/shopify/orders`
- **API version:** `2024-10` (or latest)

### Step 3: Test Webhook

After creating, click **Send test notification** to verify it works.

You should see in Vercel logs:
```
✅ Received Shopify order webhook: {...}
```

---

## Troubleshooting

### Issue: Webhooks not being received

**Check:**
1. Webhook is created in Shopify Admin
2. URL is correct: `https://store.labessentials.com/api/webhooks/shopify/orders`
3. `SHOPIFY_WEBHOOK_SECRET` matches the value in Shopify Admin

**Test manually:**
```bash
# Send a test webhook from Shopify Admin
# Then check logs immediately:
npx vercel logs store.labessentials.com --scope=henzelabs-projects | tail -20
```

### Issue: "Invalid webhook signature"

**Solution:** The `SHOPIFY_WEBHOOK_SECRET` environment variable doesn't match Shopify's secret.

1. Get the secret from Shopify Admin → Settings → Notifications → Webhooks
2. Update on Vercel:
```bash
echo -n "YOUR_WEBHOOK_SECRET" | npx vercel env add SHOPIFY_WEBHOOK_SECRET production --scope=henzelabs-projects
```
3. Redeploy:
```bash
git commit --allow-empty -m "Trigger redeploy" && git push origin main
```

### Issue: GA4 or Taboola not tracking

**Check if secrets are set:**
```bash
npx vercel env ls production --scope=henzelabs-projects
```

**Add missing secrets:**
```bash
# GA4 Measurement Protocol Secret
echo -n "YOUR_GA4_SECRET" | npx vercel env add GA4_MEASUREMENT_PROTOCOL_SECRET production --scope=henzelabs-projects

# Taboola Advertiser ID
echo -n "YOUR_TABOOLA_ID" | npx vercel env add TABOOLA_ADVERTISER_ID production --scope=henzelabs-projects
```

---

## Testing Webhooks

### Manual Test (Safe - No Real Order)

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Click on your `Order creation` webhook
3. Click **Send test notification**
4. Check Vercel logs:
```bash
npx vercel logs store.labessentials.com --scope=henzelabs-projects | grep "webhook" | tail -10
```

### Test with Real Order

Place a test order on your store:
1. Go to: https://store.labessentials.com
2. Add a product to cart
3. Complete checkout (use Shopify test mode if available)
4. Check logs for the order number

---

## Current Webhook Status

To check current status, run:

```bash
# Check recent webhook activity
npx vercel logs store.labessentials.com --scope=henzelabs-projects \
  | grep -E "Received Shopify order webhook|GA4 purchase|Taboola S2S" \
  | tail -20
```

**Expected output if working:**
```
2025-10-31T20:30:00.000Z  Received Shopify order webhook: {orderId: 6107518533691, orderNumber: 1258, ...}
2025-10-31T20:30:01.000Z  Successfully sent purchase event to GA4: 1258
2025-10-31T20:30:01.000Z  ✅ Taboola S2S purchase tracked: 1258
```

**If empty:** Either no orders recently OR webhooks not configured/working.

---

## Webhook Endpoint Details

**URL Structure:**
- Production: `https://store.labessentials.com/api/webhooks/shopify/orders`
- Preview: `https://[deployment-url].vercel.app/api/webhooks/shopify/orders`

**HTTP Method:** `POST`

**Required Headers:**
- `x-shopify-hmac-sha256` - HMAC signature for verification
- `x-shopify-shop-domain` - Store domain
- `x-shopify-topic` - Event type (e.g., `orders/create`)

**Response:**
- `200 OK` - Webhook processed successfully
- `401 Unauthorized` - Invalid HMAC signature
- `500 Server Error` - Processing error

---

## Analytics Integration Status

| Platform | Status | Notes |
|----------|--------|-------|
| **Google Analytics 4** | ✅ Configured | Measurement ID: G-7NR2JG1EDP |
| **Taboola Pixel** | ✅ Configured | Pixel ID: 1759164 |
| **Microsoft Clarity** | ✅ Active | Project ID: m5xby3pax0 |
| **GTM Container** | ✅ Installed | Container: GTM-WNG6Z9ZD |

All analytics platforms receive purchase events via webhooks for accurate server-side conversion tracking.
