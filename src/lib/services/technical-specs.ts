import { shopifyFetch } from '@/lib/shopify';
import { Redis } from '@upstash/redis';
import {
  GET_PRODUCT_WITH_SPECS,
  GET_PRODUCT_TYPE_SPECS,
} from '@/lib/queries/technical-specs';
import {
  TechnicalSpecifications,
  ProductWithSpecs,
  SpecsCacheEntry,
  SupportedProductType,
  SpecificationItem,
  DownloadItem,
  CompatibilityMetafieldValue,
  SpecsMetafieldValue,
  DownloadsMetafieldValue,
  TechnicalSpecMetafield,
} from '@/types/technical-specs';

// Redis cache instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache configuration
const CACHE_CONFIG = {
  TTL: 3600, // 1 hour in seconds
  PREFIX: 'tech_specs',
  FALLBACK_TTL: 86400, // 24 hours for fallback data
};



/**
 * Parse metafield value based on its type
 */
function parseMetafieldValue<T>(metafield: TechnicalSpecMetafield): T | null {
  try {
    switch (metafield.type) {
      case 'json':
        return JSON.parse(metafield.value) as T;
      case 'single_line_text_field':
      case 'multi_line_text_field':
        return metafield.value as T;
      case 'list.single_line_text_field':
        return metafield.value.split('\n').filter(Boolean) as T;
      default:
        return metafield.value as T;
    }
  } catch (error) {
    console.error(`Failed to parse metafield ${metafield.key}:`, error);
    return null;
  }
}

/**
 * Transform metafields into structured technical specifications
 */
function transformMetafieldsToSpecs(
  metafields: TechnicalSpecMetafield[],
): TechnicalSpecifications {
  const metafieldMap = new Map(metafields.map((m) => [m.key, m]));

  // Parse specifications
  const specsMetafield = metafieldMap.get('specifications');
  let specifications: SpecificationItem[] = [];
  if (specsMetafield) {
    const parsed = parseMetafieldValue<SpecsMetafieldValue>(specsMetafield);
    if (parsed?.specifications) {
      specifications = Object.entries(parsed.specifications).map(
        ([key, value], index) => ({
          key,
          value: String(value),
          order: index,
        }),
      );
    }
  }

  // Parse compatibility
  const compatibilityMetafield = metafieldMap.get('compatibility');
  let compatibility: string[] = [];
  if (compatibilityMetafield) {
    const parsed = parseMetafieldValue<CompatibilityMetafieldValue>(
      compatibilityMetafield,
    );
    compatibility = parsed?.items || [];
  }

  // Parse downloads
  const downloadsMetafield = metafieldMap.get('downloads');
  let downloads: DownloadItem[] = [];
  if (downloadsMetafield) {
    const parsed =
      parseMetafieldValue<DownloadsMetafieldValue>(downloadsMetafield);
    downloads = parsed?.items || [];
  }

  // Get product type
  const productTypeMetafield = metafieldMap.get('product_type');
  const productType = productTypeMetafield?.value || 'general';

  return {
    specifications,
    compatibility,
    downloads,
    productType,
  };
}

/**
 * Generate cache key for technical specifications
 */
function getCacheKey(productHandle: string): string {
  return `${CACHE_CONFIG.PREFIX}:${productHandle}`;
}

/**
 * Cache technical specifications in Redis
 */
async function cacheSpecs(
  productHandle: string,
  specs: TechnicalSpecifications,
): Promise<void> {
  try {
    const cacheEntry: SpecsCacheEntry = {
      data: specs,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.TTL,
    };

    const key = getCacheKey(productHandle);
    await redis.setex(key, CACHE_CONFIG.TTL, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error(`Failed to cache specs for ${productHandle}:`, error);
  }
}

/**
 * Get cached technical specifications from Redis
 */
async function getCachedSpecs(
  productHandle: string,
): Promise<TechnicalSpecifications | null> {
  try {
    const key = getCacheKey(productHandle);
    const cached = await redis.get(key);

    if (cached) {
      const cacheEntry: SpecsCacheEntry = JSON.parse(cached as string);

      // Check if cache is still valid
      const now = Date.now();
      const age = now - cacheEntry.timestamp;

      if (age < cacheEntry.ttl * 1000) {
        return cacheEntry.data;
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to get cached specs for ${productHandle}:`, error);
    return null;
  }
}

/**
 * Fetch technical specifications for a product
 */
export async function getTechnicalSpecs(
  productHandle: string,
): Promise<TechnicalSpecifications> {
  // Try cache first
  const cached = await getCachedSpecs(productHandle);
  if (cached) {
    return cached;
  }

  try {
    // Fetch from Shopify
    const response = await shopifyFetch<{ product: ProductWithSpecs }>({
      query: GET_PRODUCT_WITH_SPECS,
      variables: { handle: productHandle },
    });

    if (response.data?.product) {
      const specs = transformMetafieldsToSpecs(
        response.data.product.metafields,
      );

      // Cache the result
      await cacheSpecs(productHandle, specs);

      return specs;
    }

    throw new Error(`Product with handle ${productHandle} not found`);
  } catch (error) {
    console.error(`Failed to fetch specs for ${productHandle}:`, error);
    throw error;
  }
}

/**
 * Get technical specifications by product type
 */
export async function getTechnicalSpecsByProductType(
  productType: SupportedProductType,
): Promise<TechnicalSpecifications> {
  const cacheKey = `${CACHE_CONFIG.PREFIX}:type:${productType}`;

  try {
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const cacheEntry: SpecsCacheEntry = JSON.parse(cached as string);
      const age = Date.now() - cacheEntry.timestamp;

      if (age < cacheEntry.ttl * 1000) {
        return cacheEntry.data;
      }
    }

    // Fetch from Shopify by product type
    const response = await shopifyFetch<{
      products: { edges: Array<{ node: ProductWithSpecs }> };
    }>({
      query: GET_PRODUCT_TYPE_SPECS,
      variables: { query: `product_type:${productType}` },
    });

    if (response.data?.products.edges.length > 0) {
      const product = response.data.products.edges[0].node;
      const specs = transformMetafieldsToSpecs(product.metafields);

      // Cache the result
      const cacheEntry: SpecsCacheEntry = {
        data: specs,
        timestamp: Date.now(),
        ttl: CACHE_CONFIG.TTL,
      };

      await redis.setex(cacheKey, CACHE_CONFIG.TTL, JSON.stringify(cacheEntry));

      return specs;
    }

    throw new Error(`No products found for product type ${productType}`);
  } catch (error) {
    console.error(
      `Failed to fetch specs for product type ${productType}:`,
      error,
    );
    throw error;
  }
}

/**
 * Preload and cache technical specifications for multiple products
 */
export async function preloadTechnicalSpecs(
  productHandles: string[],
): Promise<void> {
  const promises = productHandles.map((handle) => getTechnicalSpecs(handle));
  await Promise.allSettled(promises);
}

/**
 * Clear cache for a specific product
 */
export async function clearSpecsCache(productHandle: string): Promise<void> {
  try {
    const key = getCacheKey(productHandle);
    await redis.del(key);
  } catch (error) {
    console.error(`Failed to clear cache for ${productHandle}:`, error);
  }
}

/**
 * Clear all specifications cache
 */
export async function clearAllSpecsCache(): Promise<void> {
  try {
    const pattern = `${CACHE_CONFIG.PREFIX}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Failed to clear all specs cache:', error);
  }
}

/**
 * Health check for the specifications service
 */
export async function healthCheck(): Promise<{
  redis: boolean;
  cache: boolean;
}> {
  const health = {
    redis: false,
    cache: false,
  };

  try {
    // Test Redis connection
    await redis.ping();
    health.redis = true;

    // Test cache functionality
    const testKey = 'health_check_test';
    await redis.setex(testKey, 10, 'test');
    const retrieved = await redis.get(testKey);
    health.cache = retrieved === 'test';
    await redis.del(testKey);
  } catch (error) {
    console.error('Specs service health check failed:', error);
  }

  return health;
}
