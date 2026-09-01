import type { MaybePromise } from "bun";
import type { MiniContext } from "./shared";

/** Arguments received by a route layout render function. */
export type LayoutRenderArguments = {
  context: MiniContext;
  /** The pre-rendered nested layout or page HTML. */
  page: string;
};

type BodyRenderFunction = (
  arguments_: LayoutRenderArguments,
) => MaybePromise<string>;

/** Options for {@link layout}. */
export type LayoutOptions = {
  /**
   * CSS selector for the nested page container swapped after compatible boosted
   * navigation. Defaults to `"body"`.
   */
  pageTarget?: string;
};

/** A route-scoped shell that wraps nested layout or page content. */
export interface MiniLayout {
  render(arguments_: LayoutRenderArguments): MaybePromise<string>;
  /**
   * CSS selector for the nested page container swapped after boosted
   * navigation.
   */
  pageTarget: string;
}

/**
 * Create a route-scoped layout shell.
 *
 * MiniFW composes matching layouts around a page and generates the document
 * scaffold through {@link mini}.
 *
 * @example
 *   const app = layout(({ page }) => `<main id="app-page">${page}</main>`, {
 *     pageTarget: "#app-page",
 *   });
 *
 * @param body Renders the nested route or page content.
 * @param options {@link LayoutOptions}.
 * @returns A new {@link MiniLayout} instance.
 */
export function layout(
  body: BodyRenderFunction,
  options?: LayoutOptions,
): MiniLayout {
  if (
    options?.pageTarget !== undefined &&
    options.pageTarget.trim().length === 0
  ) {
    throw new TypeError("layout({ pageTarget }) requires a non-empty selector");
  }

  return {
    render: body,
    pageTarget: options?.pageTarget ?? "body",
  };
}
