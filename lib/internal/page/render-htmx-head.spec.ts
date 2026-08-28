import { describe, expect, test } from "bun:test";
import { renderHtmxHead } from "./render-htmx-head";

describe("page/renderHtmxHead", () => {
  test("returns empty string when head is missing", () => {
    expect(renderHtmxHead()).toBe("");
  });

  test("renders all supported head tags", () => {
    const output = renderHtmxHead({
      title: "Title",
      description: "Desc",
      canonical: "https://example.com",
      robots: "index,follow",
    });

    expect(output).toContain("<title>Title</title>");
    expect(output).toContain('<meta name="description" content="Desc">');
    expect(output).toContain(
      '<link rel="canonical" href="https://example.com">',
    );
    expect(output).toContain('<meta name="robots" content="index,follow">');
  });
});
