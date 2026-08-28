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

/** Convert Mini page definitions into Bun route handlers. */
export function buildPages(
  routes: Record<string, MiniPage>,
  layout: MiniLayout,
) {
  const bunRoutes: Record<string, (req: Request) => Promise<Response>> = {};

  for (const [path, page] of Object.entries(routes)) {
    bunRoutes[path] = async (req: Request) => {
      try {
        const ctx = buildContext(req, path);
        const ttl = normalizeCacheTtl(page.cache);
        const cacheEnabled =
          page.cache === true || page.cache === false
            ? page.cache === true
            : page.cache != null;
        const cacheKey = pageCacheKey(path, ctx);

        if (cacheEnabled) {
          const cached = getCached(cacheKey);
          if (cached != null) {
            return new Response(cached, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
        }

        const renderedPage = await page.render(ctx);
        const body = !ctx.isHtmx
          ? await layout.render({
              context: ctx,
              page: renderedPage,
              head: page.head,
            })
          : renderedPage;

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
