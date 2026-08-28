import { describe, expect, test } from "bun:test";
import { MiniHttpError } from "../helpers/error";
import { partial } from "./partial";
import type { MiniContext } from "./shared";

const render = () => "ok";

describe("partial", () => {
  const baseRequest = new Request("http://localhost/partial/test");

  test("renders content for HTMX requests by default", async () => {
    const view = partial(({ params }) => `User: ${params["user"]}`);
    const context: MiniContext = {
      request: baseRequest,
      url: new URL(baseRequest.url),
      params: { user: "alice" },
      isHtmx: true,
    };

    const output = await view.render(context);

    expect(output).toBe("User: alice");
  });

  test("blocks non-HTMX requests when allowNonHtmx is false", async () => {
    const view = partial(() => "Never returned", {
      allowNonHtmx: false,
    });
    const context: MiniContext = {
      request: baseRequest,
      url: new URL(baseRequest.url),
      params: {},
      isHtmx: false,
    };

    const act = () => view.render(context);

    expect(act).toThrow(MiniHttpError);

    try {
      await act();
    } catch (error) {
      const httpError = error as MiniHttpError;
      expect(httpError.status).toBe(400);
      expect(httpError.message).toBe("Partial requests must be made via HTMX.");
    }
  });

  test("allows non-HTMX requests when allowNonHtmx is true", async () => {
    const view = partial(() => "Allowed", {
      allowNonHtmx: true,
    });
    const context: MiniContext = {
      request: baseRequest,
      url: new URL(baseRequest.url),
      params: {},
      isHtmx: false,
    };

    const output = await view.render(context);

    expect(output).toBe("Allowed");
  });

  test("stores cache options when provided", () => {
    const indefinite = partial(render, { cache: true, allowNonHtmx: true });
    const ttl = partial(render, { cache: { ttl: 100 }, allowNonHtmx: true });

    expect(indefinite.cache).toBe(true);
    expect(ttl.cache).toEqual({ ttl: 100 });
  });

  test("creates a partial with a style function via overload", async () => {
    const view = partial(
      ({ params }) => `User: ${params["user"]}`,
      () => ".user{display:block}",
      { allowNonHtmx: true },
    );

    expect(typeof view.style).toBe("function");
    expect(await view.style?.()).toBe(".user{display:block}");

    const output = await view.render({
      request: baseRequest,
      url: new URL(baseRequest.url),
      params: { user: "alice" },
      isHtmx: true,
      route: "/partial/test",
    });

    expect(output).toContain("User: alice");
  });

  test("converts unexpected style failures into HTTP 500 errors", async () => {
    const view = partial(
      () => "ok",
      () => {
        throw new Error("Style failed");
      },
      { allowNonHtmx: true },
    );
    const act = () => view.style!();

    expect(act).toThrow(MiniHttpError);
  });
});
