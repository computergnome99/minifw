import type { MaybePromise } from "bun";
import { wrapRender } from "../internal/layout/wrap-render";
import type { MiniContext, MiniHead } from "./shared";

/**
 * HTMX loading strategy for a {@link MiniLayout}.
 *
 * - `"cdn"` inserts a remote `<script>` tag pointing to the specified HTMX
 *   version on unpkg.
 * - `"local"` calls `loadFn` and inlines the returned source inside a `<script>`
 *   tag (useful when bundling `node_modules/htmx.org`).
 */
export type MiniHtmxConfig =
  | {
      type: "cdn";
      /** The HTMX semver string or major version number, e.g. `"2.0.4"`. */
      version: string | number;
    }
  | {
      type: "local";
      /** Returns the raw HTMX source to be inlined. */
      loadFn: () => MaybePromise<string>;
    };

/** Arguments received by layout body and head render functions. */
export type LayoutRenderArguments = {
  context: MiniContext;
  /** The pre-rendered page HTML, to be placed inside `<body>`. */
  page: string;
  /** Optional {@link MiniHead} metadata from the matched page. */
  head?: MiniHead;
  /** Optional global CSS injected into `<head>` without encapsulation. */
  globalStylesCss?: string;
  /** Optional global scripts injected into `<head>`. */
  globalScripts?: string;
};

type BodyRenderFunction = (
  arguments_: LayoutRenderArguments,
) => MaybePromise<string>;
type HeadRenderFunction = (
  arguments_: LayoutRenderArguments,
) => MaybePromise<string>;

/** Options for {@link layout}. */
export type LayoutOptions = {
  /**
   * HTMX loading strategy. When provided, a `<script>` tag is automatically
   * inserted at the end of `<head>`.
   */
  htmx?: MiniHtmxConfig;
  /**
   * Attributes applied to the generated `<body>` element. A `undefined` value
   * renders the attribute as boolean (no value), e.g. `{ "data-boost":
   * undefined }` → `<body data-boost>`.
   */
  bodyArguments?: Record<string, string | undefined>;

  /** Disables MiniFW's client runtime for promoting swapped scoped styles. */
  disableRuntime?: boolean;
};

/**
 * Represents a layout that wraps a {@link MiniPage} and provides a shared outer
 * shell (e.g. `<html>`, `<head>`, `<body>`) around page content.
 *
 * Layouts are applied at an application level. As such, layouts should be
 * generic and not contain page-specific content.
 */
export interface MiniLayout {
  render(arguments_: LayoutRenderArguments): MaybePromise<string>;
}

export function layout(
  body: BodyRenderFunction,
  options?: LayoutOptions,
): MiniLayout;
export function layout(
  body: BodyRenderFunction,
  head: HeadRenderFunction,
  options?: LayoutOptions,
): MiniLayout;
/**
 * Create a new {@link MiniLayout} instance.
 *
 * The layout generates a full HTML document automatically — `<!DOCTYPE html>`,
 * `<html>`, `<head>` (with charset, `<title>`, description, robots, and
 * canonical tags derived from the page's {@link MiniHead}), and `<body>`.
 *
 * @example
 *   // Body only — outer shell is generated automatically.
 *   const example = layout(({ page }) => html`<main>${page}</main>`);
 *
 * @example
 *   // With custom head content and options.
 *   const example = layout(
 *     ({ page }) => html`<main>${page}</main>`,
 *     () => html`<link rel="stylesheet" href="/app.css" />`,
 *     {
 *       htmx: { type: "cdn", version: "2.0.4" },
 *       bodyArguments: { class: "dark", "data-boost": undefined },
 *     },
 *   );
 *
 * @param body Renders the content placed inside the generated `<body>` tag.
 * @param headOrOptions A function that renders extra `<head>` tags appended
 *   after the auto-generated meta tags, or {@link LayoutOptions} when called
 *   without a head function.
 * @param options {@link LayoutOptions} — only used when a head function is also
 *   provided.
 * @returns A new {@link MiniLayout} instance.
 */
export function layout(
  body: BodyRenderFunction,
  headOrOptions?: HeadRenderFunction | LayoutOptions,
  options?: LayoutOptions,
): MiniLayout {
  const headFunction =
    typeof headOrOptions === "function" ? headOrOptions : undefined;
  const options_ =
    typeof headOrOptions === "function" ? options : headOrOptions;
  return { render: wrapRender(body, headFunction, options_) };
}
