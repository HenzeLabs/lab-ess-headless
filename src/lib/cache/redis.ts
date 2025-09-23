import { createClient, RedisClientType } from 'redis';

interface CacheConfig {
  defaultTtl: number;
  maxRetries: number;
  retryDelay: number;
  keyPrefix: string;
}

class CacheManager {
  private client: RedisClientType | null = null;
  private connected = false;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtl: 3600, // 1 hour
      maxRetries: 3,
      retryDelay: 1000,
      keyPrefix: 'lab-essentials:',
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.config.maxRetries) {
              return new Error('Max retries exceeded');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.connected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis disconnected');
        this.connected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.connected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const cacheTtl = ttl || this.config.defaultTtl;

      await this.client.setEx(this.getKey(key), cacheTtl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      await this.client.del(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async getTtl(key: string): Promise<number> {
    if (!this.connected || !this.client) {
      return -1;
    }

    try {
      return await this.client.ttl(this.getKey(key));
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.connected || !this.client) {
      return keys.map(() => null);
    }

    try {
      const cacheKeys = keys.map((key) => this.getKey(key));
      const values = await this.client.mGet(cacheKeys);

      return values.map((value) => {
        try {
          return value ? JSON.parse(value) : null;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const pipeline = this.client.multi();

      entries.forEach(({ key, value, ttl }) => {
        const serializedValue = JSON.stringify(value);
        const cacheTtl = ttl || this.config.defaultTtl;
        pipeline.setEx(this.getKey(key), cacheTtl, serializedValue);
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      console.error('Cache health check error:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<Record<string, any>> {
    if (!this.connected || !this.client) {
      return {};
    }

    try {
      const info = await this.client.info();
      return { info, connected: this.connected };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: this.connected };
    }
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

// Cache decorator for async functions
export function cached<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  ttl?: number,
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const key = keyGenerator(...args);
      return withCache(key, () => method.apply(this, args), ttl);
    };

    return descriptor;
  };
}

export { CacheManager };
