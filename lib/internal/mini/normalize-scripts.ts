import type { MiniScriptEntry, MiniScripts } from "./types";

/** Normalize global script configuration to an array form. */
export function normalizeScripts(
  scripts: MiniScripts | undefined,
): MiniScriptEntry[] {
  if (scripts == null) {
    return [];
  }

  return Array.isArray(scripts) ? scripts : [scripts];
}
