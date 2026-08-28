import { describe, expect, test } from "bun:test";
import { extractBodyStyles } from "./extract-body-styles";

describe("layout/extractBodyStyles", () => {
  test("extracts and deduplicates tagged style nodes", () => {
    const input =
      '<section><main>Body</main></section><style fwid="abc">.a{color:red}</style><style fwid="abc">.a{color:red}</style>';

    const output = extractBodyStyles(input);

    expect(output.content).toContain("<section><main>Body</main></section>");
    expect(output.styles).toHaveLength(1);
    expect(output.styles[0]).toContain('fwid="abc"');
  });

  test("ignores untagged style nodes", () => {
    const input = "<main>Body</main><style>.a{color:red}</style>";

    const output = extractBodyStyles(input);

    expect(output.styles).toEqual([]);
    expect(output.content).toContain("<main>Body</main>");
  });
});
