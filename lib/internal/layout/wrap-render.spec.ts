import { describe, expect, test } from "bun:test";
import { MiniHttpError, error } from "../../helpers/error";
import { wrapRender } from "./wrap-render";
import type { LayoutRenderArgs } from "../../core/layout";
import type { MiniContext } from "../../core/shared";

describe("layout/wrapRender", () => {
  const context: MiniContext = {
    request: new Request("http://localhost/"),
    url: new URL("http://localhost/"),
    params: {},
    isHtmx: false,
  };

  const args: LayoutRenderArgs = { context, page: "<main>Body</main>" };

  test("returns built document when no error occurs", async () => {
    const render = wrapRender(({ page }) => page, undefined, {
      disableRuntime: true,
    });

    const output = await render(args);

    expect(output).toContain("<main>Body</main>");
  });

  test("rethrows MiniHttpError", async () => {
    const render = wrapRender(
      () => {
        error(418, "teapot");
      },
      undefined,
      undefined,
    );

    await expect(() => render(args)).toThrow(MiniHttpError);
  });

  test("converts unknown errors to HTTP 500 MiniHttpError", async () => {
    const render = wrapRender(
      () => {
        throw new Error("boom");
      },
      undefined,
      undefined,
    );

    await expect(() => render(args)).toThrow(MiniHttpError);
  });
});
