import { describe, expect, test } from "bun:test";
import { buildDocument } from "./build-document";
import type { LayoutRenderArguments } from "../../core/layout";
import type { MiniContext } from "../../core/shared";

describe("layout/buildDocument", () => {
  const context: MiniContext = {
    request: new Request("http://localhost/"),
    url: new URL("http://localhost/"),
    params: {},
    isHtmx: false,
  };

  test("assembles a document with head metadata and body content", async () => {
    const arguments_: LayoutRenderArguments = {
      context,
      page: "<main>Body</main>",
      head: { title: "Home", description: "Desc" },
    };

    const output = await buildDocument(
      arguments_,
      ({ page }) => page,
      undefined,
      undefined,
    );

    expect(output).toContain("<!DOCTYPE html>");
    expect(output).toContain("<title>Home</title>");
    expect(output).toContain('<meta name="description" content="Desc">');
    expect(output).toContain("<main>Body</main>");
    expect(output).toContain('hx-boost="true" hx-boost:inherited="true"');
  });

  test("injects global styles and scripts", async () => {
    const arguments_: LayoutRenderArguments = {
      context,
      page: "<main>Body</main>",
      globalStylesCss: "body{color:red}",
      globalScripts: "window.__x=1",
    };

    const output = await buildDocument(
      arguments_,
      ({ page }) => page,
      undefined,
      {
        disableRuntime: true,
      },
    );

    expect(output).toContain("<style>body{color:red}</style>");
    expect(output).toContain("<script>window.__x=1</script>");
  });
});
