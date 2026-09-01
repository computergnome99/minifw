import type { MiniLayout } from "../../core/layout";
import type { MiniPage } from "../../core/page";
import type { MiniContext, MiniHead } from "../../core/shared";
import {
  normalizeCacheTtl,
  pageCacheKey,
  getCached,
  setCached,
} from "../cache";
import { minify } from "../minify";
import { isMiniRedirect } from "../../helpers/redirect-to";
import { buildContext } from "./build-context";
import { composeLayouts, isSameLayoutChain, resolveLayouts } from "./layouts";

type BuildPagesOptions = {
  layouts: Record<string, MiniLayout>;
  renderDocument(arguments_: {
    context: MiniContext;
    head?: MiniHead;
    page: string;
  }): Promise<string>;
};

/**
 * Convert Mini page definitions into Bun route handlers.
 *
 * @param routes
 * @param options - Layouts and the full-document renderer.
 */
export function buildPages(
  routes: Record<string, MiniPage>,
  options: BuildPagesOptions,
) {
  const bunRoutes: Record<string, (request: Request) => Promise<Response>> = {};

  for (const [path, page] of Object.entries(routes)) {
    bunRoutes[path] = async (request: Request) => {
      try {
        const context = buildContext(request, path);
        const destinationLayouts = resolveLayouts(
          options.layouts,
          context.url.pathname,
        );
        const headers = {
          "Content-Type": "text/html; charset=utf-8",
          ...(context.isHtmx && {
            "HX-Retarget":
              destinationLayouts.at(-1)?.layout.pageTarget ?? "body",
          }),
        };

        if (
          context.isHtmx &&
          request.headers.get("HX-Boosted") === "true" &&
          !hasCompatibleCurrentLayouts(
            request,
            destinationLayouts,
            options.layouts,
          )
        ) {
          return new Response(undefined, {
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "HX-Redirect": `${context.url.pathname}${context.url.search}`,
            },
          });
        }
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
          : await options.renderDocument({
              context,
              head: page.head,
              page: await composeLayouts(
                renderedPage,
                destinationLayouts,
                context,
              ),
            });

        const minifiedBody = await minify.html(body);

        if (isCacheEnabled) {
          setCached(cacheKey, minifiedBody, ttl);
        }

        return new Response(minifiedBody, {
          headers,
        });
      } catch (error) {
        if (isMiniRedirect(error)) return error.response;
        throw error;
      }
    };
  }

  return bunRoutes;
}

function hasCompatibleCurrentLayouts(
  request: Request,
  destinationLayouts: ReturnType<typeof resolveLayouts>,
  layouts: Record<string, MiniLayout>,
): boolean {
  const currentUrl = request.headers.get("HX-Current-URL");
  if (!currentUrl) return false;

  try {
    const current = new URL(currentUrl);
    const destination = new URL(request.url);
    if (current.origin !== destination.origin) return false;

    return isSameLayoutChain(
      resolveLayouts(layouts, current.pathname),
      destinationLayouts,
    );
  } catch {
    return false;
  }
}
