import type { MiniLayout } from "../../core/layout";
import type { MiniPage } from "../../core/page";
import {
  normalizeCacheTtl,
  pageCacheKey,
  getCached,
  setCached,
} from "../cache";
import { minify } from "../minify";
import { buildContext } from "./build-context";
import { renderErrorResponse } from "./render-error-response";
import type { MiniErrorHandler } from "./types";

/**
 * Convert Mini page definitions into Bun route handlers.
 *
 * @param routes
 * @param layout
 * @param onError
 */
export function buildPages(
  routes: Record<string, MiniPage>,
  layout: MiniLayout,
  onError?: MiniErrorHandler,
) {
  const bunRoutes: Record<string, (request: Request) => Promise<Response>> = {};

  for (const [path, page] of Object.entries(routes)) {
    bunRoutes[path] = async (request: Request) => {
      try {
        const context = buildContext(request, path);
        const headers = {
          "Content-Type": "text/html; charset=utf-8",
          ...(context.isHtmx && { "HX-Retarget": layout.pageTarget }),
        };
        const ttl = normalizeCacheTtl(page.cache);
        const isCacheEnabled =
          page.cache === true || page.cache === false
            ? page.cache === true
            : page.cache != undefined;
        const cacheKey = pageCacheKey(path, context);

        if (isCacheEnabled) {
          const cached = getCached(cacheKey);
          if (cached != undefined) {
            return new Response(cached, {
              headers,
            });
          }
        }

        const renderedPage = await page.render(context);
        const body = context.isHtmx
          ? renderedPage
          : await layout.render({
              context: context,
              page: renderedPage,
              head: page.head,
            });

        const minifiedBody = await minify.html(body);

        if (isCacheEnabled) {
          setCached(cacheKey, minifiedBody, ttl);
        }

        return new Response(minifiedBody, {
          headers,
        });
      } catch (error) {
        onError?.(error, request);
        return renderErrorResponse(error);
      }
    };
  }

  return bunRoutes;
}
