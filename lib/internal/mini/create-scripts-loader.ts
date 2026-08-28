import { loadScriptEntry } from "./load-script-entry";
import { normalizeScripts } from "./normalize-scripts";
import type { MiniScripts } from "./types";

/**
 * Create a memoized loader that resolves and combines global scripts.
 *
 * @param scripts
 */
export function createScriptsLoader(
  scripts: MiniScripts | undefined,
): () => Promise<string | undefined> {
  const entries = normalizeScripts(scripts);

  if (entries.length === 0) {
    return async () => {};
  }

  let memoized: Promise<string | undefined> | undefined;

  return async () => {
    memoized ??= (async () => {
      const scriptChunks = await Promise.all(
        entries.map((entry) => loadScriptEntry(entry)),
      );
      const combined = scriptChunks
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0)
        .join("\n");

      if (combined.length === 0) {
        return;
      }

      return combined;
    })();

    return await memoized;
  };
}
