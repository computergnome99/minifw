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
  render(context: MiniContext): MaybePromise<string>;
  style?(): MaybePromise<string>;

  head?: MiniHead;
  cache?: MiniCacheOptions;
}

type PageRenderFunction = (context: MiniContext) => MaybePromise<string>;
type PageStyleFunction = () => MaybePromise<string>;

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
export function page(
  render: PageRenderFunction,
  options?: PageOptions,
): MiniPage;
export function page(
  render: PageRenderFunction,
  style: PageStyleFunction,
  options?: PageOptions,
): MiniPage;
export function page(
  render: PageRenderFunction,
  styleOrOptions?: PageStyleFunction | PageOptions,
  options?: PageOptions,
): MiniPage {
  const styleFunction =
    typeof styleOrOptions === "function" ? styleOrOptions : undefined;
  const options_ =
    typeof styleOrOptions === "function" ? options : styleOrOptions;

  validateCacheOptions(options_?.cache);

  /**
   * Unified page render pipeline with style encapsulation and error mapping.
   *
   * @param context
   */
  const wrappedRender = async (context: MiniContext): Promise<string> => {
    try {
      const renderedPage = await render(context);
      const rawStyle = wrappedStyle ? await wrappedStyle() : undefined;

      const encapsulated =
        rawStyle && context.route
          ? encapsulateStyles(renderedPage, rawStyle, context.route)
          : undefined;
      const markup = encapsulated?.markup ?? renderedPage;
      const style = encapsulated?.css ?? rawStyle;

      const body = inlineStyle(markup, style, context.route);

      if (!context.isHtmx) {
        return body;
      }

      const head = renderHtmxHead(options_?.head);
      return head ? `${head}\n${body}` : body;
    } catch (error_) {
      if (isMiniHttpError(error_)) {
        throw error_;
      }

      if (error_ instanceof Error) {
        error(500, error_.message);
      }

      error(500, "Internal Server Error");
    }
  };

  /** Wrap style resolution so style function failures map to Mini HTTP errors. */
  const wrappedStyle = styleFunction
    ? async (): Promise<string> => {
        try {
          return await styleFunction();
        } catch (error_) {
          if (isMiniHttpError(error_)) {
            throw error_;
          }

          if (error_ instanceof Error) {
            error(500, error_.message);
          }

          error(500, "Internal Server Error");
        }
      }
    : undefined;

  return {
    render: wrappedRender,
    style: wrappedStyle,
    head: options_?.head,
    cache: options_?.cache,
  };
}
