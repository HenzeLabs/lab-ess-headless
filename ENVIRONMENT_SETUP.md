# Environment Variables Setup Guide

Complete guide for configuring all environment variables for Lab Essentials headless storefront.

## Table of Contents

- [Quick Start](#quick-start)
- [Critical Variables](#critical-variables)
- [Analytics Variables](#analytics-variables)
- [Recommended Variables](#recommended-variables)
- [Optional Variables](#optional-variables)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the required variables** (see sections below)

3. **Verify your configuration**:
   ```bash
   node scripts/verify-env.js
   ```

4. **Restart your development server**:
   ```bash
   npm run dev
   ```

---

## Critical Variables

These variables are **REQUIRED** for the app to function.

### `SHOPIFY_STORE_DOMAIN`

**Description**: Your Shopify store's domain

**Format**: `your-store.myshopify.com` (without https://)

**Where to find it**:
1. Log into your Shopify admin
2. Look at your URL bar: `https://admin.shopify.com/store/YOUR-STORE-NAME`
3. Your domain is: `YOUR-STORE-NAME.myshopify.com`

**Example**:
```bash
SHOPIFY_STORE_DOMAIN=labessentials.myshopify.com
```

---

### `SHOPIFY_STOREFRONT_ACCESS_TOKEN`

**Description**: Public token for Shopify Storefront API

**Where to get it**:
1. Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps"
3. Create a new app or select existing
4. Configure → Storefront API → Check all needed scopes
5. Copy the "Storefront API access token"

**Required Scopes**:
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_product_tags`
- `unauthenticated_read_collection_listings`
- `unauthenticated_read_customers`

**Example**:
```bash
SHOPIFY_STOREFRONT_ACCESS_TOKEN=abc123def456ghi789jkl012mno345
```

---

### `NEXT_PUBLIC_SITE_URL`

**Description**: Your public site URL (no trailing slash)

**Format**: Must start with `http://` or `https://`

**Usage**: Used for SEO, sitemaps, canonical URLs, Open Graph tags

**Examples**:
```bash
# Production
NEXT_PUBLIC_SITE_URL=https://labessentials.com

# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Analytics Variables

These variables enable **server-side conversion tracking** via Shopify webhooks.

### `GA4_MEASUREMENT_PROTOCOL_SECRET`

**Description**: GA4 API secret for sending purchase events from server

**Why needed**:
- Backup tracking if client-side is blocked
- 100% reliable purchase tracking
- No ad blocker interference

**How to get it**:
1. Open [Google Analytics](https://analytics.google.com/)
2. Admin → Data Streams → Select your web stream
3. Measurement Protocol API secrets → Create
4. Name it: "Shopify Webhook Integration"
5. Copy the secret value

**Documentation**: [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

**Example**:
```bash
GA4_MEASUREMENT_PROTOCOL_SECRET=abc123XYZ789-secretKey
```

**Test it works**:
```bash
curl -X POST "https://www.google-analytics.com/mp/collect?measurement_id=G-QCSHJ4TDMY&api_secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"test","events":[{"name":"test_event"}]}'
```

---

### `SHOPIFY_WEBHOOK_SECRET`

**Description**: Secret for verifying Shopify webhook authenticity

**Why needed**:
- Security: Prevents fake webhook calls
- Validates requests actually come from Shopify

**How to get it**:
1. Shopify Admin → Settings → Notifications
2. Scroll to "Webhooks"
3. Create webhook:
   - **Event**: `Order creation`
   - **Format**: `JSON`
   - **URL**: `https://your-site.com/api/webhooks/shopify/orders`
   - **API version**: `2025-01` or latest
4. After creating, the secret appears in the webhook details

**Important**: Keep this secret secure! It's used to verify HMAC signatures.

**Example**:
```bash
SHOPIFY_WEBHOOK_SECRET=shpss_abc123def456ghi789jkl012mno345
```

**Webhook Configuration**:
```json
{
  "webhook": {
    "topic": "orders/create",
    "address": "https://your-site.com/api/webhooks/shopify/orders",
    "format": "json"
  }
}
```

---

### `TABOOLA_ADVERTISER_ID`

**Description**: Your Taboola advertiser ID for S2S conversion tracking

**Why needed**:
- Server-side purchase tracking to Taboola
- Better attribution for Taboola campaigns

**How to get it**:
1. Log into [Taboola Ads Manager](https://ads.taboola.com/)
2. Account → Pixel & Events
3. Find your Advertiser ID (numeric)

**Note**: This is different from the Pixel ID (1759164) already in the code.

**Example**:
```bash
TABOOLA_ADVERTISER_ID=1234567
```

**Documentation**: [Taboola S2S Tracking](https://help.taboola.com/hc/en-us/articles/360004563154)

---

## Recommended Variables

These enable additional features and security.

### `SHOPIFY_ADMIN_ACCESS_TOKEN`

**Description**: Admin API token for advanced features

**When needed**:
- Order management
- Customer data access
- Inventory updates
- Advanced analytics

**How to get it**:
1. Same app as Storefront token
2. Configure → Admin API → Grant scopes
3. Copy "Admin API access token"

**Required Scopes**:
- `read_products`
- `read_orders`
- `read_customers`
- `read_inventory`

**Example**:
```bash
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_abc123def456ghi789
```

---

### `JWT_ACCESS_SECRET`

**Description**: Secret for signing JWT access tokens (user authentication)

**Format**: Minimum 32 characters, random string

**Generate a secure secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example**:
```bash
JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

### `JWT_REFRESH_SECRET`

**Description**: Secret for signing JWT refresh tokens

**Important**: Must be DIFFERENT from `JWT_ACCESS_SECRET`

**Generate**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example**:
```bash
JWT_REFRESH_SECRET=z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
```

---

### `ADMIN_EMAILS`

**Description**: Comma-separated list of admin email addresses

**Usage**: Controls access to admin dashboard and features

**Example**:
```bash
ADMIN_EMAILS=admin@labessentials.com,support@labessentials.com,manager@labessentials.com
```

---

## Optional Variables

### Performance & Caching

#### `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`

**Description**: Upstash Redis for edge caching

**When to use**: For production performance optimization

**How to get**:
1. Sign up at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy REST URL and Token

**Example**:
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AabBCcdDEefFGghHIijJKklLMmnNOopP
```

---

#### `REDIS_URL`

**Description**: Self-hosted Redis connection string

**When to use**: If you have your own Redis server

**Example**:
```bash
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional_password
REDIS_DB=0
```

---

### Admin & Security

#### `REVALIDATE_SECRET`

**Description**: Secret for triggering on-demand ISR revalidation

**Usage**: API endpoint `/api/revalidate?secret=YOUR_SECRET&path=/products/handle`

**Generate**:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Example**:
```bash
REVALIDATE_SECRET=abc123def456ghi789
```

---

#### `ADMIN_TOKEN`

**Description**: Bearer token for admin API endpoints

**Example**:
```bash
ADMIN_TOKEN=secure_admin_api_token_abc123
```

---

## Verification

### Automatic Verification

Run the verification script:

```bash
node scripts/verify-env.js
```

**Output Example**:
```
✅ SHOPIFY_STORE_DOMAIN - Valid
✅ SHOPIFY_STOREFRONT_ACCESS_TOKEN - Valid
⚠️  GA4_MEASUREMENT_PROTOCOL_SECRET - Not set
```

---

### Manual Verification

#### Check Shopify Connection

```bash
curl -X POST "https://YOUR-STORE.myshopify.com/api/2025-01/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: YOUR_TOKEN" \
  -d '{"query":"{ shop { name } }"}'
```

**Expected**: `{"data":{"shop":{"name":"Lab Essentials"}}}`

---

#### Check GA4 Measurement Protocol

```bash
curl -X POST "https://www.google-analytics.com/mp/collect?measurement_id=G-QCSHJ4TDMY&api_secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client",
    "events": [{
      "name": "test_connection",
      "params": {"test": true}
    }]
  }'
```

**Expected**: HTTP 204 (no content) = Success

Check in GA4 DebugView (enable with `?debug_mode=1`)

---

#### Test Webhook Endpoint

```bash
# Local development
curl -X POST http://localhost:3000/api/webhooks/shopify/orders \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: test" \
  -d '{"id":123}'
```

**Expected**: `{"error":"Invalid signature"}` (because we don't have valid HMAC)

This confirms the endpoint is working and validating signatures.

---

## Troubleshooting

### "Cannot read property 'SHOPIFY_STORE_DOMAIN'"

**Cause**: Environment variables not loaded

**Fix**:
1. Ensure `.env.local` exists
2. Restart development server: `npm run dev`
3. Check file is in project root (not in subdirectory)

---

### "Invalid Shopify token"

**Cause**: Token expired or wrong scopes

**Fix**:
1. Regenerate token in Shopify admin
2. Ensure all required scopes are checked
3. Update `.env.local`
4. Restart server

---

### "Webhook signature validation failed"

**Cause**: Wrong `SHOPIFY_WEBHOOK_SECRET` or webhook not from Shopify

**Fix**:
1. Copy exact secret from Shopify webhook settings
2. Ensure no extra spaces or newlines
3. Update `.env.local`
4. Redeploy if in production

---

### "GA4 events not appearing"

**Checklist**:
- [ ] `GA4_MEASUREMENT_PROTOCOL_SECRET` is set correctly
- [ ] Measurement ID in code matches GA4 property
- [ ] API secret is from correct data stream
- [ ] Check GA4 DebugView for errors
- [ ] Wait 24-48 hours for reports (real-time should be instant)

---

### "Redis connection failed"

**Cause**: Invalid Redis URL or token

**Fix**:
1. Verify credentials in Upstash dashboard
2. Check URL format: `https://` prefix
3. Ensure token is REST token (not regular token)
4. Test connection:
   ```bash
   curl https://YOUR-URL \
     -H "Authorization: Bearer YOUR-TOKEN" \
     -d "PING"
   ```

---

## Security Best Practices

### ✅ DO:
- Use different secrets for JWT access and refresh tokens
- Rotate secrets periodically (quarterly)
- Keep secrets out of version control (`.env.local` is in `.gitignore`)
- Use strong, random secrets (32+ characters)
- Limit Shopify token scopes to only what you need

### ❌ DON'T:
- Commit `.env.local` to git
- Share secrets in Slack/email
- Use same secret for multiple purposes
- Use weak/predictable secrets
- Expose secrets in client-side code

---

## Environment-Specific Configs

### Development (`.env.local`)

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SHOPIFY_STORE_DOMAIN=labessentials.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_dev_token

# Can skip analytics vars in development
# GA4_MEASUREMENT_PROTOCOL_SECRET=
# SHOPIFY_WEBHOOK_SECRET=
# TABOOLA_ADVERTISER_ID=
```

---

### Production (Vercel/Hosting Platform)

Set all variables in your hosting platform's dashboard:

**Vercel**:
1. Project Settings → Environment Variables
2. Add each variable
3. Choose "Production" environment
4. Redeploy

**Important Production Variables**:
```bash
NEXT_PUBLIC_SITE_URL=https://labessentials.com
SHOPIFY_STORE_DOMAIN=labessentials.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=prod_token
GA4_MEASUREMENT_PROTOCOL_SECRET=prod_ga4_secret
SHOPIFY_WEBHOOK_SECRET=prod_webhook_secret
TABOOLA_ADVERTISER_ID=prod_advertiser_id
JWT_ACCESS_SECRET=prod_jwt_access_secret
JWT_REFRESH_SECRET=prod_jwt_refresh_secret
```

---

## Complete .env.local Template

```bash
# =================================================================
# CRITICAL - REQUIRED
# =================================================================
SHOPIFY_STORE_DOMAIN=labessentials.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token_here
NEXT_PUBLIC_SITE_URL=https://labessentials.com

# =================================================================
# ANALYTICS - REQUIRED FOR SERVER-SIDE TRACKING
# =================================================================
GA4_MEASUREMENT_PROTOCOL_SECRET=your_ga4_api_secret_here
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
TABOOLA_ADVERTISER_ID=your_taboola_advertiser_id_here

# =================================================================
# RECOMMENDED - ENHANCED FEATURES
# =================================================================
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_admin_token_here
JWT_ACCESS_SECRET=your_32_char_plus_secret_here
JWT_REFRESH_SECRET=your_different_32_char_plus_secret_here
ADMIN_EMAILS=admin@labessentials.com,support@labessentials.com

# =================================================================
# OPTIONAL - PERFORMANCE & CACHING
# =================================================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
REVALIDATE_SECRET=your_revalidate_secret_here
ADMIN_TOKEN=your_admin_api_token_here

# =================================================================
# LEGACY (KEEP FOR BACKWARDS COMPATIBILITY)
# =================================================================
NEXT_PUBLIC_SHOPIFY_DOMAIN=labessentials.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=your_storefront_token_here
SHOPIFY_API_KEY=your_api_key_if_needed
SHOPIFY_API_SECRET=your_api_secret_if_needed
```

---

## Need Help?

- **Shopify API**: https://shopify.dev/docs
- **GA4 Measurement Protocol**: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- **Taboola Tracking**: https://help.taboola.com/hc/en-us
- **Project Issues**: https://github.com/your-repo/issues

---

**Last Updated**: 2025-01-20
**Maintained By**: Lab Essentials Development Team
