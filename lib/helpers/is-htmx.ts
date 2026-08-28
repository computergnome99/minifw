/**
 * Checks if the request is an HTMX request by looking for the "HX-Request"
 * header.
 *
 * @param req The incoming request object.
 * @returns `true` if the request is an HTMX request, otherwise `false`.
 */
export function isHtmx(req: Request): boolean {
  return req.headers.get("HX-Request") === "true";
}
