/**
 * Simple in-memory cache with TTL for API responses.
 *
 * Prevents duplicate external API calls when the same company
 * is researched multiple times within the TTL window.
 *
 * Entries are evicted lazily on access (checked at read time)
 * and proactively once the cache exceeds MAX_ENTRIES.
 */

interface CacheEntry<T = unknown> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 500;

/** Return a cached value if it exists and hasn't expired, otherwise `null`. */
export function getCached<T = unknown>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Store a value in the cache with an optional TTL (defaults to 30 min). */
export function setCache<T = unknown>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  // Evict oldest entries if the cache is too large
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

/** Build a deterministic cache key from a route name and its input parameters. */
export function cacheKey(route: string, params: Record<string, unknown>): string {
  // Sort keys for deterministic ordering
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      // Only include primitive values in the key (skip large payloads)
      const v = params[k];
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        acc[k] = v;
      }
      return acc;
    }, {});
  return `${route}:${JSON.stringify(sorted)}`;
}
