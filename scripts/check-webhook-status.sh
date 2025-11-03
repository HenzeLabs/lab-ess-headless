#!/bin/bash

# Shopify Webhook Status Checker
# Checks Vercel logs for recent webhook activity

echo "🔍 Checking Shopify Webhook Status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📡 Searching for webhook deliveries in the last 24 hours..."
echo ""

# Check for successful webhook receipts
echo "✅ Successful Webhook Deliveries:"
npx vercel logs store.labessentials.com --scope=henzelabs-projects 2>&1 | \
  grep -i "Received Shopify order webhook" | \
  tail -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for GA4 purchase events
echo "📊 GA4 Purchase Events Sent:"
npx vercel logs store.labessentials.com --scope=henzelabs-projects 2>&1 | \
  grep -i "Successfully sent purchase event to GA4" | \
  tail -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for Taboola conversions
echo "📈 Taboola S2S Conversions Tracked:"
npx vercel logs store.labessentials.com --scope=henzelabs-projects 2>&1 | \
  grep -i "Taboola S2S purchase tracked" | \
  tail -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for errors
echo "❌ Webhook Errors (if any):"
npx vercel logs store.labessentials.com --scope=henzelabs-projects 2>&1 | \
  grep -iE "Invalid webhook signature|Missing HMAC|Webhook processing error|GA4 Measurement Protocol error|Taboola S2S error" | \
  tail -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check environment variables
echo "🔐 Required Environment Variables:"
npx vercel env ls production --scope=henzelabs-projects 2>&1 | \
  grep -E "SHOPIFY_WEBHOOK_SECRET|GA4_MEASUREMENT|TABOOLA_ADVERTISER_ID" | \
  awk '{print "  " $0}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Summary:"
echo "  • If you see webhook deliveries above, webhooks are working ✅"
echo "  • If empty, either no recent orders OR webhooks not configured"
echo "  • Check Shopify Admin → Settings → Notifications → Webhooks"
echo "  • Webhook URL: https://store.labessentials.com/api/webhooks/shopify/orders"
echo ""
