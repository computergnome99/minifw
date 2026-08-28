import { describe, expect, test } from "bun:test";
import { buildBodyAttrs } from "./build-body-attrs";

describe("layout/buildBodyAttrs", () => {
  test("returns empty string for undefined body args", () => {
    expect(buildBodyAttrs(undefined)).toBe("");
  });

  test("builds attribute string with boolean and valued attributes", () => {
    const output = buildBodyAttrs({ class: "dark", "data-boost": null });

    expect(output).toContain(' class="dark"');
    expect(output).toContain("data-boost");
  });
});
