import { describe, expect, test } from "bun:test";
import { inlineStyle } from "./inline-style";

describe("page/inlineStyle", () => {
  test("returns original markup when route or style is missing", () => {
    expect(inlineStyle("<main>x</main>", undefined, "/x")).toBe(
      "<main>x</main>",
    );
    expect(inlineStyle("<main>x</main>", "", "/x")).toBe("<main>x</main>");
    expect(inlineStyle("<main>x</main>", ".x{}", undefined)).toBe(
      "<main>x</main>",
    );
  });

  test("appends a deterministic scoped style tag", () => {
    const output = inlineStyle("<main>x</main>", ".x{color:red}", "/x");

    expect(output).toContain("<main>x</main>");
    expect(output).toContain('<style fwid="');
    expect(output).toContain(".x{color:red}</style>");
  });
});
