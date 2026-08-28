import { describe, expect, test } from "bun:test";
import { inlineStyle } from "./inline-style";

describe("partial/inlineStyle", () => {
  test("returns original markup when route or style is missing", () => {
    expect(inlineStyle("<p>x</p>", undefined, "/partial/x")).toBe("<p>x</p>");
    expect(inlineStyle("<p>x</p>", "", "/partial/x")).toBe("<p>x</p>");
    expect(inlineStyle("<p>x</p>", ".x{}", undefined)).toBe("<p>x</p>");
  });

  test("appends a deterministic scoped style tag", () => {
    const output = inlineStyle("<p>x</p>", ".x{display:block}", "/partial/x");

    expect(output).toContain("<p>x</p>");
    expect(output).toContain('<style fwid="');
    expect(output).toContain(".x{display:block}</style>");
  });
});
