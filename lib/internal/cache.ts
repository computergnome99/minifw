import type { MiniCacheOptions, MiniContext } from "../core/shared";

/** Stored render cache value and optional expiration timestamp. */
type CacheEntry = {
  value: string;
  expiresAt?: number;
};

/** In-memory response cache keyed by deterministic route/context signatures. */
const renderCache = new Map<string, CacheEntry>();

/**
 * Convert user-facing cache options into a concrete TTL value.
 *
 * `true` means cache indefinitely, so this returns `undefined`.
 *
 * @param cache
 */
export function normalizeCacheTtl(
  cache: MiniCacheOptions | undefined,
): number | undefined {
  if (!cache) return undefined;
  if (cache === true) return undefined;
  return cache.ttl;
}

/**
 * Read a cached value and evict it if it has expired.
 *
 * @param cacheKey
 */
export function getCached(cacheKey: string): string | undefined {
  const entry = renderCache.get(cacheKey);
  if (!entry) return undefined;

  if (entry.expiresAt != undefined && Date.now() > entry.expiresAt) {
    renderCache.delete(cacheKey);
    return undefined;
  }

  return entry.value;
}

/**
 * Store a value in the render cache with an optional TTL.
 *
 * @param cacheKey
 * @param value
 * @param ttl
 */
export function setCached(cacheKey: string, value: string, ttl?: number): void {
  const expiresAt = ttl == undefined ? undefined : Date.now() + ttl;
  renderCache.set(cacheKey, { value, expiresAt });
}

/**
 * Produce a stable string representation of params for cache keys.
 *
 * @param parameters
 */
export function stableParameters(parameters: Record<string, string>): string {
  const entries = Object.entries(parameters).toSorted(([a], [b]) =>
    a.localeCompare(b),
  );
  return JSON.stringify(entries);
}

/**
 * Build a deterministic cache key for page responses.
 *
 * @param path
 * @param context
 */
export function pageCacheKey(
  path: string,
  context: MiniContext,
  layoutPrefixLength?: number,
): string {
  return [
    "page",
    path,
    context.url.pathname,
    context.url.search,
    String(context.isHtmx),
    String(layoutPrefixLength),
    stableParameters(context.params),
  ].join("|");
}

/**
 * Build a deterministic cache key for partial responses.
 *
 * @param name
 * @param context
 */
export function partialCacheKey(name: string, context: MiniContext): string {
  return [
    "partial",
    name,
    context.url.pathname,
    context.url.search,
    String(context.isHtmx),
    stableParameters(context.params),
  ].join("|");
}
