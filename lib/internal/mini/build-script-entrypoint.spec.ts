import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildScriptEntrypoint } from "./build-script-entrypoint";

describe("buildScriptEntrypoint", () => {
  test("builds and minifies a TypeScript entrypoint", async () => {
    const dir = await mkdtemp(join(tmpdir(), "minifw-build-script-"));
    const entry = join(dir, "entry.ts");

    try {
      await Bun.write(
        entry,
        "const value: number = 2; console.log(value + 1);",
      );

      const output = await buildScriptEntrypoint(entry);

      expect(output).toContain("console.log");
      expect(output).not.toContain(": number");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
