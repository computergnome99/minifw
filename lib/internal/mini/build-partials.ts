import type { MiniPartial } from "../../core/partial";
import {
  normalizeCacheTtl,
  partialCacheKey,
  getCached,
  setCached,
} from "../cache";
import { minify } from "../minify";
import { buildContext } from "./build-context";
import { renderErrorResponse } from "./render-error-response";
import type { MiniErrorHandler } from "./types";

/**
 * Convert Mini partial definitions into Bun route handlers.
 *
 * @param partials
 * @param onError
 */
export function buildPartials(
  partials: Record<string, MiniPartial>,
  onError?: MiniErrorHandler,
) {
  const bunRoutes: Record<string, (request: Request) => Promise<Response>> = {};

  for (const [name, partial] of Object.entries(partials)) {
    const normalizedName = name.replace(/^\/+/, "");

    bunRoutes[`/partial/${normalizedName}`] = async (request: Request) => {
      try {
        const context = buildContext(request, `/partial/${normalizedName}`);
        const ttl = normalizeCacheTtl(partial.cache);
        const isCacheEnabled =
          partial.cache === true || partial.cache === false
            ? partial.cache === true
            : partial.cache != undefined;
        const cacheKey = partialCacheKey(normalizedName, context);

        if (isCacheEnabled) {
          const cached = getCached(cacheKey);
          if (cached != undefined) {
            return new Response(cached, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
        }

        const body = await partial.render(context);
        const minifiedBody = await minify.html(body);

        if (isCacheEnabled) {
          setCached(cacheKey, minifiedBody, ttl);
        }

        return new Response(minifiedBody, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch (error) {
        onError?.(error, request);
        return renderErrorResponse(error);
      }
    };
  }

  return bunRoutes;
}
