/** Read Bun route params from a request, defaulting to an empty object. */
export function extractParams(req: Request): Record<string, string> {
  return (req as { params?: Record<string, string> }).params ?? {};
}
