import type { MaybePromise } from "bun";
import { error, isMiniHttpError } from "../../helpers/error";
import type { LayoutOptions, LayoutRenderArgs } from "../../core/layout";
import { buildDocument } from "./build-document";

/** Wrap layout rendering with document assembly and consistent error mapping. */
export function wrapRender(
  bodyFn: (args: LayoutRenderArgs) => MaybePromise<string>,
  headFn: ((args: LayoutRenderArgs) => MaybePromise<string>) | undefined,
  opts: LayoutOptions | undefined,
): (args: LayoutRenderArgs) => Promise<string> {
  return async (args: LayoutRenderArgs): Promise<string> => {
    try {
      return await buildDocument(args, bodyFn, headFn, opts);
    } catch (caught) {
      if (isMiniHttpError(caught)) throw caught;
      if (caught instanceof Error) error(500, caught.message);
      error(500, "Internal Server Error");
    }
  };
}
