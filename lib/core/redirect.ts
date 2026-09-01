/**
 * Create a redirect response for use as a native route entry in {@link mini}.
 *
 * @example
 *   mini({
 *     routes: {
 *       "/docs": redirect("/docs/getting-started", 301),
 *     },
 *   });
 *
 * @param url The destination URL.
 * @param status The redirect status code. Defaults to `302`.
 * @returns A redirect {@link Response}.
 */
export function redirect(url: string | URL, status = 302): Response {
  return Response.redirect(url, status);
}
