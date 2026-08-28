import type { MaybePromise } from "bun";
import { error, isMiniHttpError } from "../../helpers/error";
import type {
  LayoutOptions,
  LayoutRenderArgs as LayoutRenderArguments,
} from "../../core/layout";
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
  return async (arguments_: LayoutRenderArguments): Promise<string> => {
    try {
      return await buildDocument(
        arguments_,
        bodyFunction,
        headFunction,
        options,
      );
    } catch (error_) {
      if (isMiniHttpError(error_)) throw error_;
      if (error_ instanceof Error) error(500, error_.message);
      error(500, "Internal Server Error");
    }
  };
}
