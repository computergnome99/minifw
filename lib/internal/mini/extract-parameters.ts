/**
 * Read Bun route params from a request, defaulting to an empty object.
 *
 * @param request
 */
export function extractParameters(request: Request): Record<string, string> {
  return (request as { params?: Record<string, string> }).params ?? {};
}
