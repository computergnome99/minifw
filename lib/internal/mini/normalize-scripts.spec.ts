import { describe, expect, test } from "bun:test";
import { normalizeScripts } from "./normalize-scripts";

describe("normalizeScripts", () => {
  test("returns empty array for undefined", () => {
    expect(normalizeScripts(undefined)).toEqual([]);
  });

  test("wraps single entry in array", () => {
    const loader = () => "console.log(1);";

    expect(normalizeScripts(loader)).toEqual([loader]);
  });

  test("returns arrays unchanged", () => {
    const a = () => "console.log(1);";
    const b = () => "console.log(2);";

    expect(normalizeScripts([a, b])).toEqual([a, b]);
  });
});
