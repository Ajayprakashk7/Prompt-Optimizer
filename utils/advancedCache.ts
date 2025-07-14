// Advanced caching system for maximum performance
export class AdvancedCache {
  private static instance: AdvancedCache;
  private memoryCache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>();
  private accessCounts = new Map<string, number>();
  private readonly MAX_CACHE_SIZE = 50;
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  static getInstance(): AdvancedCache {
    if (!AdvancedCache.instance) {
      AdvancedCache.instance = new AdvancedCache();
    }
    return AdvancedCache.instance;
  }

  // Get with automatic cleanup and LRU eviction
  get<T>(key: string, ttl: number = this.DEFAULT_TTL): T | null {
    const now = Date.now();
    const timestamp = this.cacheTimestamps.get(key);
    
    // Check if expired
    if (timestamp && now - timestamp > ttl) {
      this.delete(key);
      return null;
    }

    const value = this.memoryCache.get(key);
    if (value !== undefined) {
      // Update access count for LRU
      this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
      return value;
    }

    return null;
  }

  // Set with automatic eviction
  set<T>(key: string, value: T): void {
    // Evict if cache is full
    if (this.memoryCache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }

    this.memoryCache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
    this.accessCounts.set(key, 1);
  }

  // Delete specific key
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.cacheTimestamps.delete(key);
    this.accessCounts.delete(key);
  }

  // Evict least recently used items
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;

    for (const [key, count] of this.accessCounts) {
      if (count < leastUsedCount) {
        leastUsedCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.delete(leastUsedKey);
    }
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps) {
      if (now - timestamp > this.DEFAULT_TTL) {
        this.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const totalAccess = Array.from(this.accessCounts.values()).reduce((a, b) => a + b, 0);
    const hits = Array.from(this.accessCounts.values()).filter(count => count > 1).length;
    
    return {
      size: this.memoryCache.size,
      hitRate: totalAccess > 0 ? hits / totalAccess : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let size = 0;
    for (const [key, value] of this.memoryCache) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(value).length * 2;
    }
    return size;
  }
}

// Memoization decorator for expensive functions
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  const cache = AdvancedCache.getInstance();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cacheKey = `memoize:${fn.name}:${key}`;
    
    const cached = cache.get<ReturnType<T>>(cacheKey, ttl);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(cacheKey, result);
    return result;
  }) as T;
}

// Cache for API responses with smart invalidation
export class APICache {
  private static instance: APICache;
  private cache = AdvancedCache.getInstance();

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 60000 // 1 minute default for API calls
  ): Promise<T> {
    const cached = this.cache.get<T>(key, ttl);
    if (cached !== null) {
      return cached;
    }

    try {
      const result = await fetcher();
      this.cache.set(key, result);
      return result;
    } catch (error) {
      // Don't cache errors, but log them
      console.error(`API cache miss for key ${key}:`, error);
      throw error;
    }
  }

  invalidate(pattern: string): void {
    // Invalidate all keys matching pattern
    for (const [key] of this.cache['memoryCache']) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instances
export const advancedCache = AdvancedCache.getInstance();
export const apiCache = APICache.getInstance();
