import { isHtmx } from "../../helpers";
import type { MiniContext } from "../../core/shared";
import { extractParams } from "./extract-params";

/** Build a MiniContext from a request and matched route. */
export function buildContext(req: Request, route?: string): MiniContext {
  return {
    request: req,
    url: new URL(req.url),
    route,
    params: extractParams(req),
    isHtmx: isHtmx(req),
  };
}
