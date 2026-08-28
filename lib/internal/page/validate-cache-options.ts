import type { MiniCacheOptions } from "../../core/shared";

/**
 * Validate page cache options and reject invalid TTL values.
 *
 * @param cache
 */
export function validateCacheOptions(
  cache: MiniCacheOptions | undefined,
): void {
  if (!cache || typeof cache === "boolean") return;
  if (!Number.isFinite(cache.ttl) || cache.ttl <= 0) {
    throw new TypeError("cache.ttl must be a positive number of milliseconds");
  }
}
