interface CacheItem<T> {
  value: T;
  expiry: number;
  created: number;
}

interface CacheConfig {
  defaultTtl: number;
  maxSize: number;
  keyPrefix: string;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtl: 3600000, // 1 hour in milliseconds
      maxSize: 1000,
      keyPrefix: 'lab-essentials:',
      ...config,
    };
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isExpired(item: CacheItem<unknown>): boolean {
    return Date.now() > item.expiry;
  }

  private cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }

    // Remove oldest items if cache is too large
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].created - b[1].created);

      const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.getKey(key);
    const item = this.cache.get(cacheKey) as CacheItem<T> | undefined;

    if (!item) {
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return item.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key);
      const cacheTtl = ttl || this.config.defaultTtl;
      const now = Date.now();

      const item: CacheItem<T> = {
        value,
        expiry: now + cacheTtl,
        created: now,
      };

      this.cache.set(cacheKey, item);

      // Periodically cleanup
      if (Math.random() < 0.1) {
        this.cleanup();
      }

      return true;
    } catch (error) {
      console.error('Memory cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key);
      return this.cache.delete(cacheKey);
    } catch (error) {
      console.error('Memory cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const cacheKey = this.getKey(key);
    const item = this.cache.get(cacheKey);

    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats(): Record<string, unknown> {
    const entries = Array.from(this.cache.values());
    const expired = entries.filter((item) => this.isExpired(item)).length;
    const active = entries.length - expired;

    return {
      totalItems: this.cache.size,
      activeItems: active,
      expiredItems: expired,
      maxSize: this.config.maxSize,
      cacheType: 'memory',
    };
  }

  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getKeyPrefix(): string {
    return this.config.keyPrefix;
  }
}

// Advanced cache manager that can use Redis or fallback to memory
class CacheManager {
  private memoryCache: MemoryCache;
  private redisCache: unknown | null = null; // Placeholder for Redis
  private useRedis = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.memoryCache = new MemoryCache(config);
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Check if Redis is available
      if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
        // In a real implementation, you would initialize Redis here
        // For now, we'll use memory cache
        console.log(
          'Redis URL provided but not implemented yet, using memory cache',
        );
      }
    } catch (error) {
      console.log('Redis not available, using memory cache');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useRedis && this.redisCache) {
      // Redis implementation would go here
      return null;
    }
    return this.memoryCache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (this.useRedis && this.redisCache) {
      // Redis implementation would go here
      return false;
    }
    return this.memoryCache.set(key, value, ttl);
  }

  async del(key: string): Promise<boolean> {
    if (this.useRedis && this.redisCache) {
      // Redis implementation would go here
      return false;
    }
    return this.memoryCache.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.useRedis && this.redisCache) {
      // Redis implementation would go here
      return false;
    }
    return this.memoryCache.exists(key);
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      // For memory cache, we need to manually find matching keys
      const entries = this.memoryCache.getAllKeys();
      const regex = new RegExp(pattern.replace('*', '.*'));

      const matchingKeys = entries.filter((key) => regex.test(key));

      for (const key of matchingKeys) {
        await this.del(key.replace(this.memoryCache.getKeyPrefix(), ''));
      }

      return true;
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
      return false;
    }
  }

  getStats(): Record<string, unknown> {
    return this.memoryCache.getStats();
  }

  async clear(): Promise<void> {
    return this.memoryCache.clear();
  }
}

// Singleton instance
let cacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager();
  }
  return cacheManager;
}

// High-level caching utilities
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
  fallbackToStale = true,
): Promise<T> {
  const cache = getCacheManager();

  try {
    // Try to get from cache first
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch data
    const data = await fetcher();

    // Store in cache
    await cache.set(key, data, ttl);

    return data;
  } catch (error) {
    console.error('Cache-with-fallback error:', error);

    // If fallback to stale is enabled, try to get stale data
    if (fallbackToStale) {
      const stale = await cache.get<T>(key);
      if (stale !== null) {
        return stale;
      }
    }

    // If no cache available, try to fetch directly
    return await fetcher();
  }
}

// Specific cache keys for Shopify data
export const CacheKeys = {
  // Products
  product: (handle: string) => `shopify:product:${handle}`,
  products: (collection?: string, page = 1) =>
    `shopify:products:${collection || 'all'}:page:${page}`,

  // Collections
  collection: (handle: string) => `shopify:collection:${handle}`,
  collections: () => 'shopify:collections:all',

  // Menu
  menu: (handle: string) => `shopify:menu:${handle}`,

  // Search
  search: (query: string, page = 1) => `shopify:search:${query}:page:${page}`,

  // Analytics
  analytics: (type: string, date?: string) =>
    `analytics:${type}:${date || 'latest'}`,

  // User sessions
  session: (sessionId: string) => `session:${sessionId}`,

  // Cart
  cart: (cartId: string) => `cart:${cartId}`,

  // API responses
  api: (endpoint: string, params?: string) =>
    `api:${endpoint}${params ? `:${params}` : ''}`,
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  DAY: 24 * 60 * 60 * 1000, // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export { CacheManager, MemoryCache };
