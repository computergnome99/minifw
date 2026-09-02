import type { MiniLayout } from "../../core/layout";
import { resolvePageHead, type MiniPage } from "../../core/page";
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
import {
  composeLayouts,
  resolveLayouts,
  sharedLayoutPrefixLength,
} from "./layouts";

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

        const sharedLayoutCount = getSharedCurrentLayoutCount(
          request,
          destinationLayouts,
          options.layouts,
        );
        if (context.isHtmx && request.headers.get("HX-Boosted") === "true") {
          if (sharedLayoutCount === undefined || sharedLayoutCount === 0) {
            return new Response(undefined, {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "HX-Redirect": `${context.url.pathname}${context.url.search}`,
              },
            });
          }

          if (sharedLayoutCount < destinationLayouts.length) {
            headers["HX-Retarget"] =
              destinationLayouts[sharedLayoutCount - 1]?.layout.pageTarget ??
              "body";
          }
        }
        const ttl = normalizeCacheTtl(page.cache);
        const isCacheEnabled =
          page.cache === true || page.cache === false
            ? page.cache === true
            : page.cache != undefined;
        const cacheKey = pageCacheKey(path, context, sharedLayoutCount);

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
          ? await renderHtmxPage(
              renderedPage,
              destinationLayouts,
              context,
              sharedLayoutCount,
            )
          : await options.renderDocument({
              context,
              head: await resolvePageHead(page.head, context),
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

function getSharedCurrentLayoutCount(
  request: Request,
  destinationLayouts: ReturnType<typeof resolveLayouts>,
  layouts: Record<string, MiniLayout>,
): number | undefined {
  if (request.headers.get("HX-Boosted") !== "true") return;

  const currentUrl = request.headers.get("HX-Current-URL");
  if (!currentUrl) return;

  try {
    const current = new URL(currentUrl);
    const destination = new URL(request.url);
    if (current.origin !== destination.origin) return;

    return sharedLayoutPrefixLength(
      resolveLayouts(layouts, current.pathname),
      destinationLayouts,
    );
  } catch {
    return;
  }
}

async function renderHtmxPage(
  page: string,
  destinationLayouts: ReturnType<typeof resolveLayouts>,
  context: MiniContext,
  sharedLayoutCount: number | undefined,
): Promise<string> {
  if (sharedLayoutCount === undefined) return page;

  return await composeLayouts(
    page,
    destinationLayouts.slice(sharedLayoutCount),
    context,
  );
}
