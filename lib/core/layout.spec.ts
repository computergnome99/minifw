import { describe, expect, test } from "bun:test";
import { layout } from "./layout";
import type { MiniContext } from "./shared";

describe("layout", () => {
  const context: MiniContext = {
    request: new Request("http://localhost/"),
    url: new URL("http://localhost/"),
    params: {},
    isHtmx: false,
  };

  const baseArguments = { context, page: "<main>Body</main>" };

  test("generates a full HTML document with body content", async () => {
    const wrapped = layout(({ page }) => page);

    const output = await wrapped.render({
      ...baseArguments,
      head: { title: "Home" },
    });

    expect(output).toContain("<!DOCTYPE html>");
    expect(output).toContain("<html>");
    expect(output).toContain("<head>");
    expect(output).toContain("<body");
    expect(output).toContain("<main>Body</main>");
    expect(output).toContain("</html>");
  });

  test("includes charset and MiniHead tags in <head>", async () => {
    const wrapped = layout(({ page }) => page);

    const output = await wrapped.render({
      ...baseArguments,
      head: {
        title: "My Page",
        description: "A description",
        canonical: "https://example.com/",
        robots: "index,follow",
      },
    });

    expect(output).toContain('<meta charset="utf-8">');
    expect(output).toContain("<title>My Page</title>");
    expect(output).toContain(
      '<meta name="description" content="A description">',
    );
    expect(output).toContain(
      '<link rel="canonical" href="https://example.com/">',
    );
    expect(output).toContain('<meta name="robots" content="index,follow">');
  });

  test("renders empty <title> when no head is provided", async () => {
    const wrapped = layout(({ page }) => page);

    const output = await wrapped.render(baseArguments);

    expect(output).toContain("<title></title>");
  });

  test("appends extra head content from head function", async () => {
    const wrapped = layout(
      ({ page }) => page,
      () => '<link rel="stylesheet" href="/app.css">',
    );

    const output = await wrapped.render(baseArguments);

    expect(output).toContain('<link rel="stylesheet" href="/app.css">');
    expect(output.indexOf("<head>")).toBeLessThan(
      output.indexOf('<link rel="stylesheet"'),
    );
  });

  test("includes configured body attributes and htmx script", async () => {
    const wrapped = layout(({ page }) => page, {
      htmx: { type: "cdn", version: "2.0.4" },
      bodyArguments: { class: "dark", "data-boost": undefined },
    });

    const output = await wrapped.render(baseArguments);

    expect(output).toContain('class="dark"');
    expect(output).toContain("data-boost");
    expect(output).toContain(
      'src="https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js"',
    );
  });
});
