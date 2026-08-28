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

/** Convert Mini partial definitions into Bun route handlers. */
export function buildPartials(partials: Record<string, MiniPartial>) {
  const bunRoutes: Record<string, (req: Request) => Promise<Response>> = {};

  for (const [name, partial] of Object.entries(partials)) {
    const normalizedName = name.replace(/^\/+/, "");

    bunRoutes[`/partial/${normalizedName}`] = async (req: Request) => {
      try {
        const ctx = buildContext(req, `/partial/${normalizedName}`);
        const ttl = normalizeCacheTtl(partial.cache);
        const cacheEnabled =
          partial.cache === true || partial.cache === false
            ? partial.cache === true
            : partial.cache != null;
        const cacheKey = partialCacheKey(normalizedName, ctx);

        if (cacheEnabled) {
          const cached = getCached(cacheKey);
          if (cached != null) {
            return new Response(cached, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
        }

        const body = await partial.render(ctx);
        const minifiedBody = await minify.html(body);

        if (cacheEnabled) {
          setCached(cacheKey, minifiedBody, ttl);
        }

        return new Response(minifiedBody, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch (caught) {
        return renderErrorResponse(caught);
      }
    };
  }

  return bunRoutes;
}
