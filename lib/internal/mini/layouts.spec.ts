import { describe, expect, test } from "bun:test";
import { layout } from "../../core/layout";
import type { MiniContext } from "../../core/shared";
import {
  composeLayouts,
  isSameLayoutChain,
  resolveLayouts,
  sharedLayoutPrefixLength,
} from "./layouts";

const context: MiniContext = {
  request: new Request("http://localhost/admin/example/report"),
  url: new URL("http://localhost/admin/example/report"),
  params: {},
  isHtmx: false,
};

const layouts = {
  "*": layout(({ page }) => `<app>${page}</app>`),
  "/admin/*": layout(({ page }) => `<admin>${page}</admin>`),
  "/admin/example/*": layout(({ page }) => `<example>${page}</example>`),
};

describe("mini/layouts", () => {
  test("resolves wildcard layouts from least to most specific", () => {
    expect(
      resolveLayouts(layouts, "/admin/example/report").map(
        ({ pattern }) => pattern,
      ),
    ).toEqual(["*", "/admin/*", "/admin/example/*"]);
  });

  test("matches a trailing wildcard at its base route and descendants", () => {
    expect(resolveLayouts(layouts, "/admin/example")).toHaveLength(3);
    expect(resolveLayouts(layouts, "/admin")).toHaveLength(2);
  });

  test("matches dynamic layout segments", () => {
    const dynamicLayouts = {
      "/projects/:projectId": layout(({ page }) => page),
    };

    expect(resolveLayouts(dynamicLayouts, "/projects/minifw")).toHaveLength(1);
    expect(
      resolveLayouts(dynamicLayouts, "/projects/minifw/settings"),
    ).toHaveLength(0);
  });

  test("composes layouts from innermost to outermost", async () => {
    const resolved = resolveLayouts(layouts, context.url.pathname);

    expect(await composeLayouts("<page>Report</page>", resolved, context)).toBe(
      "<app><admin><example><page>Report</page></example></admin></app>",
    );
  });

  test("compares resolved chains by their patterns", () => {
    expect(
      isSameLayoutChain(
        resolveLayouts(layouts, "/admin/example/one"),
        resolveLayouts(layouts, "/admin/example/two"),
      ),
    ).toBe(true);
    expect(
      isSameLayoutChain(
        resolveLayouts(layouts, "/admin/example/one"),
        resolveLayouts(layouts, "/admin/other"),
      ),
    ).toBe(false);
  });

  test("counts shared outer layouts", () => {
    expect(
      sharedLayoutPrefixLength(
        resolveLayouts(layouts, "/"),
        resolveLayouts(layouts, "/admin/example/report"),
      ),
    ).toBe(1);
    expect(
      sharedLayoutPrefixLength(
        resolveLayouts(layouts, "/admin/one"),
        resolveLayouts(layouts, "/admin/example/report"),
      ),
    ).toBe(2);
    expect(
      sharedLayoutPrefixLength(
        resolveLayouts(layouts, "/admin/example/one"),
        resolveLayouts(layouts, "/admin/example/two"),
      ),
    ).toBe(3);
  });
});
