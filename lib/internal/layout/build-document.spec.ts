import { describe, expect, test } from "bun:test";
import { buildDocument } from "./build-document";
import type { MiniContext } from "../../core/shared";

const context: MiniContext = {
  request: new Request("http://localhost/"),
  url: new URL("http://localhost/"),
  params: {},
  isHtmx: false,
};

describe("layout/buildDocument", () => {
  test("assembles a document without route layouts", async () => {
    const output = await buildDocument(
      { context, page: "<main>Body</main>", head: { title: "Home" } },
      { runtime: false, htmx: false },
    );

    expect(output).toContain("<!DOCTYPE html>");
    expect(output).toContain("<html>");
    expect(output).toContain("<head>");
    expect(output).toContain("<title>Home</title>");
    expect(output).toContain("<body");
    expect(output).toContain("<main>Body</main>");
    expect(output).not.toContain("hx-boost");
  });

  test("applies document attributes, head content, and global assets", async () => {
    const output = await buildDocument(
      {
        context,
        page: "<main>Body</main>",
        globalStylesCss: "body{color:red}",
        globalScripts: "window.__x=1",
      },
      {
        document: {
          htmlAttributes: { lang: "en" },
          bodyAttributes: { class: "app" },
          head: ({ head }) =>
            `<link rel="icon" href="/favicon.svg" data-title="${head?.title ?? ""}">`,
        },
        runtime: false,
        htmx: false,
      },
    );

    expect(output).toContain('<html lang="en">');
    expect(output).toContain('<body class="app"');
    expect(output).toContain(
      '<link rel="icon" href="/favicon.svg" data-title="">',
    );
    expect(output).toContain("<style>body{color:red}</style>");
    expect(output).toContain("<script>window.__x=1</script>");
  });
});
