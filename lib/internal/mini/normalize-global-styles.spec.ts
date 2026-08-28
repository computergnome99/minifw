import { describe, expect, test } from "bun:test";
import { normalizeGlobalStyles } from "./normalize-global-styles";

const loader = () => ".a { color: red; }";
const a = () => ".a{}";
const b = () => ".b{}";

describe("normalizeGlobalStyles", () => {
  test("returns empty array for undefined", () => {
    expect(normalizeGlobalStyles(undefined)).toEqual([]);
  });

  test("wraps single entry in array", () => {
    expect(normalizeGlobalStyles(loader)).toEqual([loader]);
  });

  test("returns arrays unchanged", () => {
    expect(normalizeGlobalStyles([a, b])).toEqual([a, b]);
  });
});
