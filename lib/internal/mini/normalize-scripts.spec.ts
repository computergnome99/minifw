import { describe, expect, test } from "bun:test";
import { normalizeScripts } from "./normalize-scripts";

const loader = () => "console.log(1);";
const a = () => "console.log(1);";
const b = () => "console.log(2);";

describe("normalizeScripts", () => {
  test("returns empty array for undefined", () => {
    expect(normalizeScripts(undefined)).toEqual([]);
  });

  test("wraps single entry in array", () => {
    expect(normalizeScripts(loader)).toEqual([loader]);
  });

  test("returns arrays unchanged", () => {
    expect(normalizeScripts([a, b])).toEqual([a, b]);
  });
});
