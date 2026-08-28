/** Serialize user-provided body attributes into HTML attribute text. */
export function buildBodyAttrs(
  bodyArgs: Record<string, string | null> | undefined,
): string {
  if (!bodyArgs || Object.keys(bodyArgs).length === 0) return "";
  const attrs = Object.entries(bodyArgs)
    .map(([k, v]) => (v === null ? k : `${k}="${v}"`))
    .join(" ");
  return ` ${attrs}`;
}
