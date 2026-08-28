import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildScriptEntrypoint } from "./build-script-entrypoint";
import type { MiniScriptEntry } from "./types";

/** Resolve one global script entry to bundled JavaScript source. */
export async function loadScriptEntry(entry: MiniScriptEntry): Promise<string> {
  if (typeof entry !== "function") {
    const filename = entry.name;
    if (!filename) {
      return await entry.text();
    }

    return await buildScriptEntrypoint(filename);
  }

  const source = (await entry()).trim();
  if (source.length === 0) {
    return "";
  }

  const tempDir = await mkdtemp(join(tmpdir(), "minifw-script-"));
  const tempEntrypoint = join(tempDir, "entry.ts");

  try {
    await Bun.write(tempEntrypoint, source);
    return await buildScriptEntrypoint(tempEntrypoint);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
