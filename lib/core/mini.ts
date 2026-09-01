import { html } from "../helpers";
import {
  buildPages,
  buildPartials,
  createGlobalStylesLoader,
  createScriptsLoader,
} from "../internal/mini/index";
import type {
  MiniErrorHandler,
  MiniGlobalStyles,
  MiniScripts,
} from "../internal/mini/index";
import { layout as createLayout } from "./layout";
import type { MiniLayout } from "./layout";
import type { MiniPage } from "./page";
import type { MiniPartial } from "./partial";

/** Called when MiniFW handles a page or partial rendering failure. */
export type { MiniErrorHandler } from "../internal/mini/index";

/**
 * Configuration options for {@link mini}. Extends Bun's serve options with
 * MiniFW-specific routing and layout fields.
 *
 * @remarks
 *   `routes` is omitted from the base Bun options and replaced with a typed map
 *   of path patterns to {@link MiniPage} instances.
 */
export interface MiniOptions extends Omit<
  Bun.Serve.Options<undefined>,
  "routes"
> {
  /** Optional {@link MiniLayout} to wrap every page response. */
  layout?: MiniLayout;
  /** Map of URL path patterns to {@link MiniPage} instances. */
  routes?: Record<string, MiniPage>;
  /**
   * Map of partial names to {@link MiniPartial} instances. Each partial is
   * served at `/partial/<name>`.
   */
  partials?: Record<string, MiniPartial>;
  /** Called when MiniFW handles a page or partial rendering failure. */
  onError?: MiniErrorHandler;
  /**
   * Global styles injected in `<head>` for full-page responses.
   *
   * Accepts a loader function (which returns CSS) or `Bun.file(...)` entries.
   * `Bun.file` entries are bundled via `Bun.build()` so imports are resolved
   * before final CSS minification.
   */
  globalStyles?: MiniGlobalStyles;
  /**
   * Global scripts injected in `<head>` for full-page responses.
   *
   * Accepts loader functions returning JS/TS source or `Bun.file(...)` entries.
   * All entries are built and minified via `Bun.build()` before injection.
   */
  scripts?: MiniScripts;
}

/** Default HTML shell used when no custom layout is provided. */
const defaultLayout = createLayout(({ page }) => html`<main>${page}</main>`);

/**
 * Start a MiniFW server.
 *
 * @example
 *   const server = mini({
 *     layout: rootLayout,
 *     routes: {
 *       "/": home,
 *       "/about": about,
 *     },
 *     partials: {
 *       header: headerPartial,
 *     },
 *   });
 *
 * @param options Server configuration including routes, partials, and layout.
 * @returns A running {@link Bun.Server} instance.
 */
export function mini(options: MiniOptions): Bun.Server<undefined> {
  const {
    layout,
    routes = {},
    partials = {},
    onError,
    globalStyles,
    scripts,
    ...bunOptions
  } = options;
  const resolvedLayout = layout ?? defaultLayout;
  const loadGlobalStyles = createGlobalStylesLoader(globalStyles);
  const loadScripts = createScriptsLoader(scripts);

  const bunRoutes = {
    ...buildPages(
      routes,
      {
        ...resolvedLayout,
        render: async (arguments_) =>
          resolvedLayout.render({
            ...arguments_,
            globalStylesCss: await loadGlobalStyles(),
            globalScripts: await loadScripts(),
          }),
      },
      onError,
    ),
    ...buildPartials(partials, onError),
  };

  return Bun.serve({
    ...bunOptions,
    routes: bunRoutes,
  } as Bun.Serve.Options<undefined>);
}
