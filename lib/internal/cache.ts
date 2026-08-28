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
 */
export function normalizeCacheTtl(
  cache: MiniCacheOptions | undefined,
): number | undefined {
  if (!cache) return undefined;
  if (cache === true) return undefined;
  return cache.ttl;
}

/** Read a cached value and evict it if it has expired. */
export function getCached(cacheKey: string): string | undefined {
  const entry = renderCache.get(cacheKey);
  if (!entry) return undefined;

  if (entry.expiresAt != null && Date.now() > entry.expiresAt) {
    renderCache.delete(cacheKey);
    return undefined;
  }

  return entry.value;
}

/** Store a value in the render cache with an optional TTL. */
export function setCached(cacheKey: string, value: string, ttl?: number): void {
  const expiresAt = ttl != null ? Date.now() + ttl : undefined;
  renderCache.set(cacheKey, { value, expiresAt });
}

/** Produce a stable string representation of params for cache keys. */
export function stableParams(params: Record<string, string>): string {
  const entries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

/** Build a deterministic cache key for page responses. */
export function pageCacheKey(path: string, ctx: MiniContext): string {
  return [
    "page",
    path,
    ctx.url.pathname,
    ctx.url.search,
    String(ctx.isHtmx),
    stableParams(ctx.params),
  ].join("|");
}

/** Build a deterministic cache key for partial responses. */
export function partialCacheKey(name: string, ctx: MiniContext): string {
  return [
    "partial",
    name,
    ctx.url.pathname,
    ctx.url.search,
    String(ctx.isHtmx),
    stableParams(ctx.params),
  ].join("|");
}
