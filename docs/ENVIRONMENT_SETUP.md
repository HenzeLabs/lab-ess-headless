# Environment Variables for Technical Specifications

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Upstash Redis Configuration (for caching technical specifications)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Shopify Storefront API (if not already configured)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

## Development Setup

1. **Redis Setup** (Upstash recommended for serverless):

   - Go to [upstash.com](https://upstash.com)
   - Create a new Redis database
   - Copy the REST URL and token

2. **Shopify Setup**:

   - Ensure Storefront API access is configured
   - Verify metafields are accessible via Storefront API

3. **Local Testing**:

   ```bash
   # Test Redis connection
   curl -X POST https://your-redis-instance.upstash.io/ping \
     -H "Authorization: Bearer your-redis-token"

   # Should return: {"result":"PONG"}
   ```

## Production Considerations

- Use separate Redis instances for dev/staging/production
- Monitor Redis memory usage and cache hit rates
- Set up Redis alerts for connection failures
- Consider Redis persistence settings based on your needs
