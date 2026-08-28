import type { MiniGlobalStyleEntry, MiniGlobalStyles } from "./types";

/**
 * Normalize global style configuration to an array form.
 *
 * @param styles
 */
export function normalizeGlobalStyles(
  styles: MiniGlobalStyles | undefined,
): MiniGlobalStyleEntry[] {
  if (styles == undefined) {
    return [];
  }

  return Array.isArray(styles) ? styles : [styles];
}
