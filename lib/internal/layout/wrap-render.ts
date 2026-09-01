import type { MaybePromise } from "bun";
import type { LayoutOptions, LayoutRenderArguments } from "../../core/layout";
import { buildDocument } from "./build-document";

/**
 * Wrap layout rendering with document assembly and consistent error mapping.
 *
 * @param bodyFunction
 * @param headFunction
 * @param options
 */
export function wrapRender(
  bodyFunction: (arguments_: LayoutRenderArguments) => MaybePromise<string>,
  headFunction:
    | ((arguments_: LayoutRenderArguments) => MaybePromise<string>)
    | undefined,
  options: LayoutOptions | undefined,
): (arguments_: LayoutRenderArguments) => Promise<string> {
  return async (arguments_: LayoutRenderArguments): Promise<string> =>
    buildDocument(arguments_, bodyFunction, headFunction, options);
}
