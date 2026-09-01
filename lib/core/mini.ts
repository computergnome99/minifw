import { buildDocument } from "../internal/layout/build-document";
import {
  buildPages,
  buildPartials,
  createGlobalStylesLoader,
  createScriptsLoader,
} from "../internal/mini/index";
import type { MiniConfig } from "./config";
import type { MiniLayout } from "./layout";
import type { MiniPage } from "./page";
import type { MiniPartial } from "./partial";

type BunRoutes = NonNullable<Bun.Serve.Options<undefined>["routes"]>;
type BunRoute = BunRoutes[string];

function isMiniPage(route: MiniPage | BunRoute): route is MiniPage {
  return typeof route === "object" && route !== null && "render" in route;
}

/**
 * Configuration options for {@link mini}. Extends Bun's serve options with
 * MiniFW-specific routing and layout fields.
 *
 * @remarks
 *   `routes` is omitted from the base Bun options and accepts either a
 *   {@link MiniPage} or a native Bun route entry for each path pattern.
 */
export interface MiniOptions extends Omit<
  Bun.Serve.Options<undefined>,
  "routes"
> {
  /** Document and browser behavior managed by MiniFW. */
  config?: MiniConfig;
  /** Route patterns mapped to composable layout shells. */
  layouts?: Record<string, MiniLayout>;
  /**
   * Map of URL path patterns to {@link MiniPage} instances or native Bun route
   * entries. Native entries are passed directly to {@link Bun.serve}.
   */
  routes?: Record<string, MiniPage | BunRoute>;
  /**
   * Map of partial names to {@link MiniPartial} instances. Each partial is
   * served at `/partial/<name>`.
   */
  partials?: Record<string, MiniPartial>;
}

/**
 * Start a MiniFW server.
 *
 * @example
 *   const server = mini({
 *     layouts: { "*": rootLayout },
 *     routes: {
 *       "/": home,
 *       "/about": about,
 *     },
 *     partials: {
 *       header: headerPartial,
 *     },
 *   });
 *
 * @param options Server configuration including routes, partials, layouts, and
 *   document config.
 * @returns A running {@link Bun.Server} instance.
 */
export function mini(options: MiniOptions): Bun.Server<undefined> {
  const {
    config,
    layouts = {},
    routes = {},
    partials = {},
    ...bunOptions
  } = options;
  const loadGlobalStyles = createGlobalStylesLoader(config?.globalStyles);
  const loadScripts = createScriptsLoader(config?.scripts);

  const pages: Record<string, MiniPage> = {};
  const nativeRoutes: BunRoutes = {};

  for (const [path, route] of Object.entries(routes)) {
    if (isMiniPage(route)) pages[path] = route;
    else nativeRoutes[path] = route;
  }

  const bunRoutes: BunRoutes = {
    ...nativeRoutes,
    ...buildPages(pages, {
      layouts,
      renderDocument: async (arguments_) =>
        buildDocument(
          {
            ...arguments_,
            globalStylesCss: await loadGlobalStyles(),
            globalScripts: await loadScripts(),
          },
          config,
        ),
    }),
    ...buildPartials(partials),
  };

  return Bun.serve({
    ...bunOptions,
    routes: bunRoutes,
  } as Bun.Serve.Options<undefined>);
}
