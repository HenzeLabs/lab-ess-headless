# Shopify Webhook Setup Checklist

**Status:** No recent webhook deliveries detected in logs
**Action Required:** Verify webhook configuration in Shopify Admin

---

## Quick Verification Steps

### Step 1: Check if Webhook Exists

1. Log in to Shopify Admin: https://labessentials.myshopify.com/admin
2. Navigate to: **Settings** → **Notifications** → **Webhooks**
3. Look for: **Order creation** webhook

**What to check:**
- ✅ Webhook exists?
- ✅ URL is: `https://store.labessentials.com/api/webhooks/shopify/orders`
- ✅ Format is: `JSON`
- ✅ Status shows recent successful deliveries (200 OK)?

---

## If Webhook Exists

### Test It

1. In the webhook details page, click **Send test notification**
2. Wait 5 seconds, then run:
   ```bash
   npx vercel logs store.labessentials.com --scope=henzelabs-projects | grep "Received Shopify order webhook" | tail -5
   ```

**Expected output:**
```
2025-10-31T21:20:00.000Z  Received Shopify order webhook: {orderId: 1234567890, orderNumber: 9999, ...}
```

### If Test Works
✅ Webhooks are configured correctly! They'll fire automatically on real orders.

### If Test Fails
Check the webhook delivery status in Shopify Admin:
- **401 Unauthorized** → HMAC signature mismatch (see fix below)
- **500 Server Error** → Check detailed error in logs
- **Timeout** → Deployment issue

---

## If Webhook DOES NOT Exist

### Create the Webhook

1. In Shopify Admin: **Settings** → **Notifications** → **Webhooks**
2. Click **Create webhook**
3. Configure:
   - **Event:** `Order creation`
   - **Format:** `JSON`
   - **URL:** `https://store.labessentials.com/api/webhooks/shopify/orders`
   - **API version:** `2024-10` (or latest stable)

4. Click **Save**
5. Copy the **Webhook Secret** that Shopify generates

### Update Environment Variable

If you had to create a new webhook, update the secret:

```bash
# Replace YOUR_WEBHOOK_SECRET with the actual secret from Shopify
echo -n "YOUR_WEBHOOK_SECRET" | npx vercel env add SHOPIFY_WEBHOOK_SECRET production --scope=henzelabs-projects
```

Then redeploy:
```bash
git commit --allow-empty -m "Trigger redeploy for webhook secret update" && git push origin main
```

Wait 2 minutes for deployment, then test again.

---

## Troubleshooting

### Issue: "Invalid webhook signature" (401 Error)

**Cause:** The `SHOPIFY_WEBHOOK_SECRET` in Vercel doesn't match Shopify's webhook secret.

**Fix:**
1. Get the correct secret from Shopify Admin → Settings → Notifications → Webhooks
2. Click on your webhook to see the secret
3. Update on Vercel:
   ```bash
   npx vercel env rm SHOPIFY_WEBHOOK_SECRET production --scope=henzelabs-projects --yes
   echo -n "CORRECT_SECRET_HERE" | npx vercel env add SHOPIFY_WEBHOOK_SECRET production --scope=henzelabs-projects
   ```
4. Redeploy:
   ```bash
   git commit --allow-empty -m "Update webhook secret" && git push origin main
   ```

### Issue: Webhook shows in Shopify but no logs in Vercel

**Possible causes:**
1. Webhook URL is incorrect (check for typos)
2. Webhook is paused/disabled in Shopify
3. No orders have been placed to trigger it

**Test manually:**
```bash
# Send a test notification from Shopify Admin
# Then immediately check:
npx vercel logs store.labessentials.com --scope=henzelabs-projects | tail -20
```

---

## What Happens When Webhook Works

When an order is placed, you'll see these logs in sequence:

```
1. Received Shopify order webhook: {orderId: XXX, orderNumber: YYY, total: "20.16", currency: "USD", itemCount: 1}
2. Successfully sent purchase event to GA4: YYY
3. ✅ Taboola S2S purchase tracked: YYY
```

This means:
- ✅ Webhook was received and verified
- ✅ Purchase event sent to Google Analytics 4
- ✅ Conversion tracked in Taboola

---

## Current Environment Status

All required environment variables are configured:

| Variable | Status | Notes |
|----------|--------|-------|
| `SHOPIFY_WEBHOOK_SECRET` | ✅ Set | Set 11 days ago |
| `GA4_MEASUREMENT_ID` | ✅ Set | G-7NR2JG1EDP |
| `GA4_MEASUREMENT_PROTOCOL_SECRET` | ✅ Set | For server-side tracking |
| `TABOOLA_ADVERTISER_ID` | ✅ Set | For conversion tracking |

---

## Quick Test Script

Run this to check webhook status anytime:

```bash
bash scripts/check-webhook-status.sh
```

Or manually:
```bash
npx vercel logs store.labessentials.com --scope=henzelabs-projects \
  | grep -E "Received Shopify order webhook|GA4 purchase|Taboola S2S" \
  | tail -10
```

---

## Next Steps

1. **Check Shopify Admin** for webhook configuration
2. **Send test notification** if webhook exists
3. **Create webhook** if it doesn't exist
4. **Verify logs** show the test order

Once you see "Received Shopify order webhook" in the logs, your webhook system is fully operational! 🎉

---

## Need Help?

If you're seeing errors or unexpected behavior, check:
- [[WEBHOOK_VERIFICATION.md](WEBHOOK_VERIFICATION.md)] - Full webhook documentation
- Vercel logs for specific error messages
- Shopify webhook delivery status in Admin
