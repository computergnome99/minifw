import type { MiniPage } from "./page";
import type { MiniPartial } from "./partial";
import type { MiniLayout } from "./layout";

/**
 * Server context passed to {@link MiniPage}, {@link MiniPartial}, and
 * {@link MiniLayout} render functions.
 */
export interface MiniContext {
  /** The raw incoming {@link Request}. */
  request: Request;
  /** The parsed request {@link URL}. */
  url: URL;
  /** The matched route path used for route-specific rendering behavior. */
  route?: string;
  /** Route parameters extracted from the matched path pattern. */
  params: Record<string, string>;
  /** Whether the request was made via HTMX (`HX-Request` header present). */
  isHtmx: boolean;
}

/**
 * HTML `<head>` metadata for a {@link MiniPage}. All fields are optional and
 * only rendered when provided.
 */
export interface MiniHead {
  /** Page title rendered in `<title>`. */
  title?: string;
  /** Meta description rendered in `<meta name="description">`. */
  description?: string;
  /** Canonical URL rendered in `<link rel="canonical">`. */
  canonical?: string;
  /** Robots directive rendered in `<meta name="robots">`. */
  robots?: string;
}

/**
 * Cache behavior for render primitives.
 *
 * - `true`: cache indefinitely.
 * - `{ ttl }`: cache for `ttl` milliseconds.
 * - `false` / `undefined`: do not cache.
 */
export type MiniCacheOptions =
  | boolean
  | {
      ttl: number;
    };
