import { describe, expect, test } from "bun:test";
import { buildHtmxTag } from "./build-htmx-tag";

describe("layout/buildHtmxTag", () => {
  test("returns the default HTMX 4 script when config is omitted", async () => {
    const output = await buildHtmxTag(undefined);

    expect(output).toContain(
      "https://unpkg.com/htmx.org@4.0.0/dist/htmx.min.js",
    );
  });

  test("returns versioned CDN HTMX script", async () => {
    const output = await buildHtmxTag({ type: "cdn", version: "2.0.4" });

    expect(output).toContain(
      "https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js",
    );
  });

  test("inlines local HTMX source", async () => {
    const output = await buildHtmxTag({
      type: "local",
      loadFn: () => "/* htmx */",
    });

    expect(output).toBe("<script>/* htmx */</script>");
  });
});
