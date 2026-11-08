/**
 * Server-Side Cache & Invalidation System (Items 4, 14, 17, 18, 19)
 * Provides:
 * 1. In-memory TTL caching for expensive queries and calculations.
 * 2. Cache stampede protection (deduplicating concurrent in-flight requests).
 * 3. Instant cache invalidation when users create or update records.
 * 4. Standardized Cache-Control headers for CDN & browser caching.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ServerCache {
  private store = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private readonly maxEntries = 500;

  /**
   * Get an item from cache, or execute fetcher and store result.
   * Includes Thundering Herd / Concurrency deduplication (Item 14).
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 30_000 // default 30s TTL
  ): Promise<T> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing && existing.expiresAt > now) {
      return existing.data as T;
    }

    // Deduplicate concurrent requests for the same key
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        // Evict oldest if reaching capacity
        if (this.store.size >= this.maxEntries) {
          const entries = Array.from(this.store.keys());
          if (entries.length > 0) this.store.delete(entries[0]);
        }
        this.store.set(key, { data: result, expiresAt: Date.now() + ttlMs });
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Invalidate specific key or all keys matching a prefix (e.g. `user:${userId}`)
   */
  invalidate(keyOrPrefix: string) {
    const keysToDelete: string[] = [];
    this.store.forEach((_, key) => {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Invalidate all cached data for a specific user upon mutations (POST/PUT/DELETE)
   */
  invalidateUser(userId: string) {
    this.invalidate(`user:${userId}`);
  }
}

// Global singleton to persist across serverless invocations
const globalForCache = globalThis as unknown as { serverCache?: ServerCache };
export const serverCache = globalForCache.serverCache ?? new ServerCache();
globalForCache.serverCache = serverCache;

/**
 * Standardized HTTP Cache Headers for API routes
 * Allows fast stale-while-revalidate caching while keeping data fresh.
 */
export function getApiCacheHeaders(sMaxAge: number = 10, staleWhileRevalidate: number = 60) {
  return {
    "Cache-Control": `private, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "CDN-Cache-Control": `max-age=${sMaxAge}`,
  };
}
