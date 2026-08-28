import { describe, expect, test } from "bun:test";
import { buildBodyAttributes } from "./build-body-attributes";

describe("layout/buildBodyAttrs", () => {
  test("returns empty string for undefined body args", () => {
    expect(buildBodyAttributes(undefined)).toBe("");
  });

  test("builds attribute string with boolean and valued attributes", () => {
    const output = buildBodyAttributes({
      class: "dark",
      "data-boost": undefined,
    });

    expect(output).toContain(' class="dark"');
    expect(output).toContain("data-boost");
  });
});
