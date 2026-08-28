/**
 * Checks if the request is an HTMX request by looking for the "HX-Request"
 * header.
 *
 * @param request The incoming request object.
 * @returns `true` if the request is an HTMX request, otherwise `false`.
 */
export function isHtmx(request: Request): boolean {
  return request.headers.get("HX-Request") === "true";
}
