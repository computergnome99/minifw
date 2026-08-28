import { describe, expect, test } from "bun:test";
import { normalizeGlobalStyles } from "./normalize-global-styles";

describe("normalizeGlobalStyles", () => {
  test("returns empty array for undefined", () => {
    expect(normalizeGlobalStyles(undefined)).toEqual([]);
  });

  test("wraps single entry in array", () => {
    const loader = () => ".a { color: red; }";

    expect(normalizeGlobalStyles(loader)).toEqual([loader]);
  });

  test("returns arrays unchanged", () => {
    const a = () => ".a{}";
    const b = () => ".b{}";

    expect(normalizeGlobalStyles([a, b])).toEqual([a, b]);
  });
});
