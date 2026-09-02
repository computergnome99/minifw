import { describe, expect, test } from "bun:test";
import { page } from "./page";
import type { MiniContext } from "./shared";

const render = ({ params }: MiniContext) => `Hello ${params["name"]}`;
const renderOk = () => "ok";

describe("page", () => {
  const context: MiniContext = {
    request: new Request("http://localhost/hello/world"),
    url: new URL("http://localhost/hello/world"),
    params: { name: "world" },
    isHtmx: false,
  };

  test("creates a page with render function and no head by default", async () => {
    const result = page(render);
    const output = await result.render(context);

    expect(typeof result.render).toBe("function");
    expect(result.head).toBeUndefined();
    expect(output).toBe("Hello world");
  });

  test("creates a page with head metadata when provided", () => {
    const head = {
      title: "Greeting",
      description: "Greeting page",
      canonical: "https://example.com/hello/world",
      robots: "index,follow",
    };

    const result = page(() => "ok", { head });

    expect(result.head).toEqual(head);
  });

  test("creates a page with a style function via overload", async () => {
    const result = page(
      ({ params }) => `Hello ${params["name"]}`,
      () => ".greet { color: red; }",
      { head: { title: "Styled" } },
    );

    expect(typeof result.style).toBe("function");
    expect(await result.style?.()).toBe(".greet { color: red; }");
  });

  test("prepends head metadata for HTMX requests", async () => {
    const result = page(() => "<main>htmx</main>", {
      head: { title: "HTMX Page", description: "HTMX description" },
    });

    const output = await result.render({
      ...context,
      route: "/hello/world",
      isHtmx: true,
    });

    expect(output).toContain("<main>htmx</main>");
  });

  test("resolves HTMX head metadata from the request context", async () => {
    const result = page(() => "<main>htmx</main>", {
      head: ({ params }) => ({ title: `Hello ${params["name"]}` }),
    });

    const output = await result.render({
      ...context,
      route: "/hello/world",
      isHtmx: true,
    });

    expect(output).toContain("<title>Hello world</title>");
  });

  test("stores cache options when provided", () => {
    const indefinite = page(renderOk, { cache: true });
    const ttl = page(renderOk, { cache: { ttl: 250 } });

    expect(indefinite.cache).toBe(true);
    expect(ttl.cache).toEqual({ ttl: 250 });
  });

  test("propagates unexpected render failures", async () => {
    const broken = page(() => {
      throw new Error("Page failed");
    });

    const act = () => broken.render(context);

    await expect(act).toThrow("Page failed");
  });

  test("propagates unexpected style failures", async () => {
    const broken = page(
      () => "ok",
      () => {
        throw new Error("Style failed");
      },
    );

    const act = () => broken.style!();

    await expect(act).toThrow("Style failed");
  });
});
