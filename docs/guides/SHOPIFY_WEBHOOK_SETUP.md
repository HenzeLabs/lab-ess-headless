# Shopify Webhook Setup for Server-Side Purchase Tracking

This guide will help you set up Shopify webhooks to track purchases server-side, fixing the 401 Unauthorized checkout API errors.

## Problem

Client-side JavaScript cannot access Shopify's checkout data due to security restrictions. The solution is to use Shopify webhooks to send purchase data server-side.

## Solution

We've created a secure webhook endpoint that:
1. Receives order data from Shopify when a purchase completes
2. Verifies the webhook is authentic (HMAC signature)
3. Sends purchase events to GA4 via Measurement Protocol
4. Can be extended for Meta, Taboola, etc.

## Setup Steps

### 1. Get GA4 Measurement Protocol API Secret

1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate to **Admin** → **Data Streams** → Select your web stream
3. Click **Measurement Protocol API secrets**
4. Click **Create** and name it "Shopify Webhooks"
5. Copy the **Secret value**

### 2. Create Shopify Webhook Secret

1. Generate a random secret (use this command or similar):
   ```bash
   openssl rand -base64 32
   ```
2. Save this value - you'll add it to both Shopify and Vercel

### 3. Get Taboola Advertiser ID

1. Log in to [Taboola Ads Manager](https://ads.taboola.com)
2. Navigate to **Tracking** → **Conversions**
3. Your Advertiser ID should be visible in the conversion tracking setup
4. Copy this ID - you'll need it for Vercel

### 4. Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **lab-ess-headless**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   ```
   GA4_MEASUREMENT_PROTOCOL_SECRET=<your-ga4-secret-from-step-1>
   SHOPIFY_WEBHOOK_SECRET=<your-generated-secret-from-step-2>
   TABOOLA_ADVERTISER_ID=<your-taboola-advertiser-id-from-step-3>
   ```

5. Click **Save** for each variable
6. Redeploy your site to apply the new variables

### 5. Configure Shopify Webhook

1. Go to your [Shopify Admin](https://admin.shopify.com)
2. Navigate to **Settings** → **Notifications**
3. Scroll down to **Webhooks**
4. Click **Create webhook**
5. Configure:
   - **Event:** `Order creation` (orders/create)
   - **Format:** `JSON`
   - **URL:** `https://store.labessentials.com/api/webhooks/shopify/orders`
   - **Webhook API version:** Latest stable version

6. In **Webhook Secret**, paste the `SHOPIFY_WEBHOOK_SECRET` from step 2
7. Click **Save webhook**

### 6. Test the Webhook

#### Option A: Use Shopify's Test Feature
1. In your webhook settings, click **Send test notification**
2. Check your Vercel logs to see if the webhook was received

#### Option B: Create a Test Order
1. Go to your live site: https://store.labessentials.com
2. Add a product to cart
3. Complete a test purchase
4. Check Vercel logs for webhook processing
5. Check GA4 DebugView (Admin → DebugView) for the purchase event

### 7. Verify in GA4 and Taboola

**Google Analytics 4:**
1. Go to GA4 → **Reports** → **Realtime**
2. Make a test purchase
3. You should see the purchase event appear within 1-2 minutes
4. Go to **Reports** → **Monetization** → **Ecommerce purchases** to see revenue data

**Taboola:**
1. Go to Taboola Ads Manager → **Tracking** → **Conversions**
2. Make a test purchase
3. Check for the purchase conversion appearing (may take a few minutes)
4. Verify order value and currency are correct

## Webhook Endpoint Details

**URL:** `https://store.labessentials.com/api/webhooks/shopify/orders`

**Security:**
- ✅ HMAC signature verification
- ✅ Shopify webhook secret validation
- ✅ Environment variables for sensitive data

**What it tracks:**
- Order ID and number
- Total price, tax, currency
- Line items (products, variants, quantities)
- Customer information (if available)

**Sends to:**
- ✅ Google Analytics 4 (via Measurement Protocol)
- ✅ Taboola S2S Conversion API
- 🔄 Meta Conversion API (can be added)

## Extending to Other Platforms

### Adding Meta Conversion API

Add this function to `/src/app/api/webhooks/shopify/orders/route.ts`:

```typescript
async function sendMetaPurchase(order: ShopifyOrder) {
  const META_PIXEL_ID = '940971967399612';
  const META_ACCESS_TOKEN = process.env.META_CONVERSION_API_TOKEN;

  if (!META_ACCESS_TOKEN) {
    console.warn('META_CONVERSION_API_TOKEN not configured');
    return;
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(new Date(order.created_at).getTime() / 1000),
        user_data: {
          em: order.customer?.email ? crypto.createHash('sha256').update(order.customer.email).digest('hex') : undefined,
        },
        custom_data: {
          currency: order.currency,
          value: parseFloat(order.total_price),
          content_ids: order.line_items.map(i => i.product_id.toString()),
          content_type: 'product',
          num_items: order.line_items.reduce((sum, i) => sum + i.quantity, 0),
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error('Meta Conversion API error:', await response.text());
    } else {
      console.log('Successfully sent purchase to Meta:', order.order_number);
    }
  } catch (error) {
    console.error('Failed to send Meta purchase:', error);
  }
}
```

Then call it in the POST handler:
```typescript
await sendGA4Purchase(order);
await sendMetaPurchase(order);  // Add this line
```

## Monitoring

### Vercel Logs
- Go to Vercel Dashboard → Your Project → **Logs**
- Filter by `/api/webhooks/shopify/orders`
- Look for successful webhook processing

### GA4 DebugView
- GA4 Admin → **DebugView**
- Enable debug mode: Add `?debug_mode=1` to your URL
- See events in real-time

### Shopify Webhook Logs
- Shopify Admin → Settings → Notifications → Webhooks
- Click on your webhook
- View **Recent deliveries** to see success/failure status

## Troubleshooting

### "Invalid signature" error
- Double-check your `SHOPIFY_WEBHOOK_SECRET` matches in both Shopify and Vercel
- Ensure you redeployed after adding environment variables

### "GA4_MEASUREMENT_PROTOCOL_SECRET not configured" warning
- Add the GA4 API secret to Vercel environment variables
- Redeploy the application

### Events not appearing in GA4
- Check Vercel logs for successful webhook processing
- Verify GA4 Measurement ID is correct (`G-QCSHJ4TDMY`)
- Wait 24-48 hours for data to appear in standard reports (use DebugView for real-time)

### Webhook not firing
- Verify webhook URL is correct in Shopify
- Check that the webhook is enabled
- Test with Shopify's "Send test notification" feature

## Benefits of Server-Side Tracking

✅ **No ad blockers** - Browsers can't block server-side events
✅ **Better attribution** - More accurate conversion tracking
✅ **Privacy compliant** - Proper data hashing and handling
✅ **Reliable** - Works even if user closes browser after checkout
✅ **Complete data** - Full order information from Shopify

## Next Steps

After setup is complete:
1. Make a test purchase to verify webhook works
2. Check GA4 for purchase events
3. Add Meta Conversion API (optional)
4. Add Taboola Conversion API (optional)
5. Monitor webhook delivery success rate

## Resources

- [Shopify Webhooks Documentation](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Meta Conversion API](https://developers.facebook.com/docs/marketing-api/conversions-api)
