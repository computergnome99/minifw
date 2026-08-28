import { describe, expect, test } from "bun:test";
import { loadScriptEntry } from "./load-script-entry";

describe("loadScriptEntry", () => {
  test("loads and builds script from loader function source", async () => {
    const output = await loadScriptEntry(
      () => "const count: number = 1; console.log(count);",
    );

    expect(output).toContain("console.log");
    expect(output).not.toContain(": number");
  });

  test("loads and bundles script from Bun.file entry", async () => {
    const output = await loadScriptEntry(
      Bun.file(import.meta.dir + "/../../core/__fixtures__/scripts/global.ts"),
    );

    expect(output).toContain("window.__miniScriptFromImport=");
    expect(output).not.toContain('from "./dep"');
  });
});
