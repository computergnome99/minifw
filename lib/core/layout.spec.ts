import { describe, expect, test } from "bun:test";
import { layout } from "./layout";
import type { MiniContext } from "./shared";

const context: MiniContext = {
  request: new Request("http://localhost/"),
  url: new URL("http://localhost/"),
  params: {},
  isHtmx: false,
};

describe("layout", () => {
  test("renders a route shell around nested page markup", async () => {
    const shell = layout(({ page }) => `<main id="view">${page}</main>`, {
      pageTarget: "#view",
    });

    expect(await shell.render({ context, page: "<p>Page</p>" })).toBe(
      '<main id="view"><p>Page</p></main>',
    );
    expect(shell.pageTarget).toBe("#view");
  });

  test("defaults the page target to body", () => {
    expect(layout(({ page }) => page).pageTarget).toBe("body");
  });

  test("rejects an empty page target", () => {
    expect(() => layout(({ page }) => page, { pageTarget: " " })).toThrow(
      "requires a non-empty selector",
    );
  });
});
