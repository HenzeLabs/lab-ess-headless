# Adding read_customers Scope to Shopify Admin API Token

**Date:** October 31, 2025
**Status:** Required for full Shopify metrics functionality

---

## Current Issue

The Shopify Admin Access Token currently has the `read_orders` scope but is **missing the `read_customers` scope**. This causes the GraphQL API to return customer data as `null`:

```json
{
  "errors": [{
    "message": "Access denied for customer field. Required access: `read_customers` access scope.",
    "extensions": {
      "code": "ACCESS_DENIED",
      "requiredAccess": "`read_customers` access scope."
    }
  }],
  "data": {
    "orders": {
      "edges": [{
        "node": {
          "customer": null  // ← Customer data is null due to missing scope
        }
      }]
    }
  }
}
```

## What Currently Works ✅

Even without `read_customers` scope, these metrics work correctly:
- Total Revenue
- Total Orders
- Average Order Value
- Top Products (with images)
- Recent Orders
- Abandoned Carts

## What's Affected ❌

Without `read_customers` scope, these metrics show as 0:
- New Customers (can't track customer IDs)
- Returning Customers (can't identify repeat purchasers)
- Customer names in order details (shows "Guest" instead)

## How to Add the read_customers Scope

### Step 1: Go to Shopify Admin API Settings

1. Log in to your Shopify Admin: https://labessentials.myshopify.com/admin
2. Navigate to: **Settings** → **Apps and sales channels** → **Develop apps**
3. Find your custom app (the one that generated the current Admin Access Token)
4. Click **Configuration**

### Step 2: Update API Scopes

1. In the **Admin API access scopes** section, look for:
   - `read_orders` (should already be checked ✅)
   - `read_customers` (needs to be checked)
2. Check the box next to `read_customers`
3. Optionally add `read_products` if you want product images in top products

### Step 3: Save and Regenerate Token

1. Click **Save** at the bottom of the configuration page
2. Shopify will prompt you to **reinstall the app** or **regenerate the access token**
3. Click **Install app** or **Regenerate token**
4. **IMPORTANT:** Copy the new Admin Access Token (starts with `shpat_`)

### Step 4: Update Environment Variable on Vercel

1. Run this command to update the token:
   ```bash
   echo -n "YOUR_NEW_TOKEN_HERE" | npx vercel env add SHOPIFY_ADMIN_ACCESS_TOKEN production --scope=henzelabs-projects
   ```

   Replace `YOUR_NEW_TOKEN_HERE` with the actual token from Step 3.

2. Trigger a redeployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy with updated Shopify token" && git push origin main
   ```

### Step 5: Verify It Works

After deployment completes (about 2 minutes), test the API:

```bash
curl "https://store.labessentials.com/api/metrics/shopify?start=2025-10-24&end=2025-10-30" | jq .
```

You should now see:
- `customers.new` with actual count (not 0)
- `customers.returning` with actual count (not 0)
- Customer names in `recentOrders` (not "Guest")

## Required Scopes Summary

For full Shopify metrics functionality, the Admin Access Token needs:

| Scope | Purpose | Status |
|-------|---------|--------|
| `read_orders` | Fetch order data, revenue, products | ✅ Already has |
| `read_customers` | Track new/returning customers | ❌ **Needs to be added** |
| `read_products` | Product images in top products | ✅ Works without (optional) |
| `read_checkouts` | Abandoned cart data | ✅ Already works |

## API Behavior Without read_customers

The code has been updated to handle missing `read_customers` scope gracefully:
- **Before fix:** API would fail completely and return error
- **After fix:** API returns all available data, logs a warning about missing scope, and sets customer fields to null/0

See commits:
- `815bd6a` - Handle access scope warnings gracefully
- `15ddf25` - Add detailed logging for debugging
- `9c01d58` - Fix TypeScript error in return statement

## Documentation Links

- [Shopify Admin API Scopes](https://shopify.dev/api/usage/access-scopes)
- [GraphQL Admin API Customer Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Customer)
