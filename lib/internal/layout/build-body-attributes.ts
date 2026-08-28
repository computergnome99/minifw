/**
 * Serialize user-provided body attributes into HTML attribute text.
 *
 * @param bodyArguments
 */
export function buildBodyAttributes(
  bodyArguments: Record<string, string | undefined> | undefined,
): string {
  if (!bodyArguments || Object.keys(bodyArguments).length === 0) return "";
  const attributes = Object.entries(bodyArguments)
    .map(([k, v]) => (v === undefined ? k : `${k}="${v}"`))
    .join(" ");
  return ` ${attributes}`;
}
