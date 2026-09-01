import type { MaybePromise } from "bun";
import { error } from "../helpers/error";
import { encapsulateStyles } from "../internal/encapsulate-styles";
import { inlineStyle } from "../internal/partial/inline-style";
import { validateCacheOptions } from "../internal/partial/validate-cache-options";
import type { MiniCacheOptions, MiniContext } from "./shared";
import type { MiniFragment } from "./fragment";

/**
 * Represents a partial that can be rendered and served with server context.
 * Partials are smaller reusable fragments that have access to request context,
 * unlike {@link MiniFragment} which is context-free.
 */
export interface MiniPartial {
  render(context: MiniContext): MaybePromise<string>;
  style?(): MaybePromise<string>;
  cache?: MiniCacheOptions;
}

type PartialRenderFunction = (context: MiniContext) => MaybePromise<string>;
type PartialStyleFunction = () => MaybePromise<string>;

type PartialOptions = {
  allowNonHtmx?: boolean;
  cache?: MiniCacheOptions;
};

/**
 * Create a new {@link MiniPartial} instance.
 *
 * @example
 *   const example = partial(() => "Hello World!");
 *
 * @example
 *   const example = partial(
 *     ({ params }) => html`<p>Welcome, ${params.user}!</p>`,
 *   );
 *
 * @example
 *   const example = partial(({ params }) =>
 *     myFragment({ name: params.user }),
 *   );
 *
 * @param render The render function for the partial.
 * @param options Optional configuration for the partial.
 * @param options.allowNonHtmx When `false` (default), non-HTMX requests to this
 *   partial return a `400` response. Set to `true` to allow regular requests.
 * @returns A new {@link MiniPartial} instance.
 */
export function partial(
  render: PartialRenderFunction,
  options?: PartialOptions,
): MiniPartial;
export function partial(
  render: PartialRenderFunction,
  style: PartialStyleFunction,
  options?: PartialOptions,
): MiniPartial;
export function partial(
  render: PartialRenderFunction,
  styleOrOptions?: PartialStyleFunction | PartialOptions,
  options?: PartialOptions,
): MiniPartial {
  const styleFunction =
    typeof styleOrOptions === "function" ? styleOrOptions : undefined;
  const options_ =
    typeof styleOrOptions === "function" ? options : styleOrOptions;

  validateCacheOptions(options_?.cache);

  const allowNonHtmx = options_?.allowNonHtmx ?? false;

  const wrappedRender = async (context: MiniContext): Promise<string> => {
    if (!allowNonHtmx && !context.isHtmx) {
      error(400, "Partial requests must be made via HTMX.");
    }

    const renderedPartial = await render(context);
    const rawStyle = wrappedStyle ? await wrappedStyle() : undefined;

    const encapsulated =
      rawStyle && context.route
        ? encapsulateStyles(renderedPartial, rawStyle, context.route)
        : undefined;
    const markup = encapsulated?.markup ?? renderedPartial;
    const style = encapsulated?.css ?? rawStyle;

    return inlineStyle(markup, style, context.route);
  };

  const wrappedStyle = styleFunction
    ? async (): Promise<string> => styleFunction()
    : undefined;

  return { render: wrappedRender, style: wrappedStyle, cache: options_?.cache };
}
