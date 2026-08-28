import type { MiniGlobalStyleEntry, MiniGlobalStyles } from "./types";

/** Normalize global style configuration to an array form. */
export function normalizeGlobalStyles(
  styles: MiniGlobalStyles | undefined,
): MiniGlobalStyleEntry[] {
  if (styles == null) {
    return [];
  }

  return Array.isArray(styles) ? styles : [styles];
}
