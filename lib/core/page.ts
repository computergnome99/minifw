import type { MaybePromise } from "bun";
import { error, isMiniHttpError } from "../helpers/error";
import { encapsulateStyles } from "../internal/encapsulate-styles";
import { inlineStyle } from "../internal/page/inline-style";
import { renderHtmxHead } from "../internal/page/render-htmx-head";
import { validateCacheOptions } from "../internal/page/validate-cache-options";
import type { MiniCacheOptions, MiniContext, MiniHead } from "./shared";

/**
 * Represents a page that can be rendered and served. Pages receive server
 * context and can optionally define {@link MiniHead} metadata.
 */
export interface MiniPage {
  render(ctx: MiniContext): MaybePromise<string>;
  style?(): MaybePromise<string>;

  head?: MiniHead;
  cache?: MiniCacheOptions;
}

type PageRenderFn = (ctx: MiniContext) => MaybePromise<string>;
type PageStyleFn = () => MaybePromise<string>;

type PageOptions = {
  head?: MiniHead;
  cache?: MiniCacheOptions;
};

/**
 * Create a new {@link MiniPage} instance.
 *
 * @example
 *   const example = page((ctx) => "Hello World!");
 *
 * @example
 *   const example = page((ctx) => html`<h1>Hello ${ctx.params.name}!</h1>`, {
 *     head: { title: "Greeting" },
 *   });
 *
 * @param render The render function for the page.
 * @param options Page options, including optional {@link MiniHead} metadata.
 * @returns A new {@link MiniPage} instance.
 */
export function page(render: PageRenderFn, options?: PageOptions): MiniPage;
export function page(
  render: PageRenderFn,
  style: PageStyleFn,
  options?: PageOptions,
): MiniPage;
export function page(
  render: PageRenderFn,
  styleOrOptions?: PageStyleFn | PageOptions,
  options?: PageOptions,
): MiniPage {
  const styleFn =
    typeof styleOrOptions === "function" ? styleOrOptions : undefined;
  const opts = typeof styleOrOptions === "function" ? options : styleOrOptions;

  validateCacheOptions(opts?.cache);

  /** Unified page render pipeline with style encapsulation and error mapping. */
  const wrappedRender = async (ctx: MiniContext): Promise<string> => {
    try {
      const renderedPage = await render(ctx);
      const rawStyle = wrappedStyle ? await wrappedStyle() : undefined;

      const encapsulated =
        rawStyle && ctx.route
          ? encapsulateStyles(renderedPage, rawStyle, ctx.route)
          : undefined;
      const markup = encapsulated?.markup ?? renderedPage;
      const style = encapsulated?.css ?? rawStyle;

      const body = inlineStyle(markup, style, ctx.route);

      if (!ctx.isHtmx) {
        return body;
      }

      const head = renderHtmxHead(opts?.head);
      return head ? `${head}\n${body}` : body;
    } catch (caught) {
      if (isMiniHttpError(caught)) {
        throw caught;
      }

      if (caught instanceof Error) {
        error(500, caught.message);
      }

      error(500, "Internal Server Error");
    }
  };

  /** Wrap style resolution so style function failures map to Mini HTTP errors. */
  const wrappedStyle = styleFn
    ? async (): Promise<string> => {
        try {
          return await styleFn();
        } catch (caught) {
          if (isMiniHttpError(caught)) {
            throw caught;
          }

          if (caught instanceof Error) {
            error(500, caught.message);
          }

          error(500, "Internal Server Error");
        }
      }
    : undefined;

  return {
    render: wrappedRender,
    style: wrappedStyle,
    head: opts?.head,
    cache: opts?.cache,
  };
}
