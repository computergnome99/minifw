import type { MiniGlobalStyleEntry } from "./types";

/**
 * Resolve one global style entry to raw CSS text.
 *
 * @param entry
 */
export async function loadGlobalStyleEntry(
  entry: MiniGlobalStyleEntry,
): Promise<string> {
  if (typeof entry === "function") {
    return await entry();
  }

  const filename = entry.name;

  if (!filename) {
    return await entry.text();
  }

  const bundleResult = await Bun.build({
    entrypoints: [filename],
    minify: false,
    sourcemap: "none",
    target: "browser",
  });

  if (!bundleResult.success) {
    const firstError = bundleResult.logs[0];
    const detail = firstError?.message ?? "Failed to bundle global styles";
    throw new Error(detail);
  }

  const cssOutput = bundleResult.outputs.find((output) =>
    output.path.endsWith(".css"),
  );

  if (!cssOutput) {
    return await entry.text();
  }

  return await cssOutput.text();
}
