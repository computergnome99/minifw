/** Internal control-flow signal used by {@link redirectTo}. */
export class MiniRedirect extends Error {
  readonly response: Response;

  constructor(url: string | URL, status: number) {
    super("Redirect");
    this.name = "MiniRedirect";
    this.response = Response.redirect(url, status);
  }
}

/**
 * Abort rendering and redirect the client.
 *
 * Use {@link redirect} from `minifw/core` when a redirect is used directly as a
 * route entry.
 *
 * @example
 *   const profile = page(({ params }) => {
 *     if (!params.userId) redirectTo("/login");
 *
 *     return "<h1>Profile</h1>";
 *   });
 *
 * @param url The destination URL.
 * @param status The redirect status code. Defaults to `302`.
 * @throws {MiniRedirect}
 */
export function redirectTo(url: string | URL, status = 302): never {
  throw new MiniRedirect(url, status);
}

/**
 * Check whether an unknown value is a MiniFW render-time redirect.
 *
 * @param value Value to check.
 * @returns True if the value is a {@link MiniRedirect}.
 */
export function isMiniRedirect(value: unknown): value is MiniRedirect {
  return value instanceof MiniRedirect;
}
