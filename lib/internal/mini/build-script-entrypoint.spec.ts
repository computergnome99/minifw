import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildScriptEntrypoint } from "./build-script-entrypoint";

describe("buildScriptEntrypoint", () => {
  test("builds and minifies a TypeScript entrypoint", async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "minifw-build-script-"),
    );
    const entry = path.join(directory, "entry.ts");

    try {
      await Bun.write(
        entry,
        "const value: number = 2; console.log(value + 1);",
      );

      const output = await buildScriptEntrypoint(entry);

      expect(output).toContain("console.log");
      expect(output).not.toContain(": number");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
