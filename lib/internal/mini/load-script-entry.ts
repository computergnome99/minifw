import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildScriptEntrypoint } from "./build-script-entrypoint";
import type { MiniScriptEntry } from "./types";

/**
 * Resolve one global script entry to bundled JavaScript source.
 *
 * @param entry
 */
export async function loadScriptEntry(entry: MiniScriptEntry): Promise<string> {
  if (typeof entry !== "function") {
    const filename = entry.name;
    if (!filename) {
      return await entry.text();
    }

    return await buildScriptEntrypoint(filename);
  }

  const resolvedEntry = await entry();
  const source = resolvedEntry.trim();
  if (source.length === 0) {
    return "";
  }

  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "minifw-script-"),
  );
  const temporaryEntrypoint = path.join(temporaryDirectory, "entry.ts");

  try {
    await Bun.write(temporaryEntrypoint, source);
    return await buildScriptEntrypoint(temporaryEntrypoint);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
