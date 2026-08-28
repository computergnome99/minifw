import { describe, expect, test } from "bun:test";
import { loadGlobalStyleEntry } from "./load-global-style-entry";

describe("loadGlobalStyleEntry", () => {
  test("loads CSS from loader function", async () => {
    const output = await loadGlobalStyleEntry(() => "body { color: red; }");

    expect(output).toContain("body { color: red; }");
  });

  test("loads and bundles CSS from Bun.file", async () => {
    const output = await loadGlobalStyleEntry(
      Bun.file(import.meta.dir + "/../../core/__fixtures__/styles/global.css"),
    );

    expect(output).toContain("--brand");
    expect(output).toContain(".app");
    expect(output).not.toContain("@import");
  });
});
