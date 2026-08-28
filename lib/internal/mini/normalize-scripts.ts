import type { MiniScriptEntry, MiniScripts } from "./types";

/**
 * Normalize global script configuration to an array form.
 *
 * @param scripts
 */
export function normalizeScripts(
  scripts: MiniScripts | undefined,
): MiniScriptEntry[] {
  if (scripts == undefined) {
    return [];
  }

  return Array.isArray(scripts) ? scripts : [scripts];
}
