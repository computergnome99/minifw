import { isHtmx } from "../../helpers";
import type { MiniContext } from "../../core/shared";
import { extractParams as extractParameters } from "./extract-parameters";

/**
 * Build a MiniContext from a request and matched route.
 *
 * @param request
 * @param route
 */
export function buildContext(request: Request, route?: string): MiniContext {
  return {
    request: request,
    url: new URL(request.url),
    route,
    params: extractParameters(request),
    isHtmx: isHtmx(request),
  };
}
