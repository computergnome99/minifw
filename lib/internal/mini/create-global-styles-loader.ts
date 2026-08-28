import { minify } from "../minify";
import { loadGlobalStyleEntry } from "./load-global-style-entry";
import { normalizeGlobalStyles } from "./normalize-global-styles";
import type { MiniGlobalStyles } from "./types";

/**
 * Create a memoized loader that resolves, combines, and minifies global CSS.
 *
 * @param styles
 */
export function createGlobalStylesLoader(
  styles: MiniGlobalStyles | undefined,
): () => Promise<string | undefined> {
  const entries = normalizeGlobalStyles(styles);

  if (entries.length === 0) {
    return async (): Promise<string | undefined> => {
      return;
    };
  }

  let memoized: Promise<string | undefined> | undefined;

  return async () => {
    memoized ??= (async () => {
      const cssChunks = await Promise.all(
        entries.map((entry) => loadGlobalStyleEntry(entry)),
      );
      const combined = cssChunks
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0)
        .join("\n");

      if (combined.length === 0) {
        return;
      }

      return minify.css(combined);
    })();

    return await memoized;
  };
}
