import { afterEach, describe, expect, test } from "bun:test";
import { layout } from "./layout";
import { mini } from "./mini";
import { page } from "./page";
import { partial } from "./partial";

const servers: Bun.Server<undefined>[] = [];

/**
 * @param server
 * @param path
 */
function localTestUrl(server: Bun.Server<undefined>, path: string): string {
  const hostname = server.hostname ?? "127.0.0.1";

  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    throw new Error(`Unexpected non-local hostname in test: ${hostname}`);
  }

  if (server.port == undefined) {
    throw new Error("Server did not expose a TCP port for test requests");
  }

  return `http://127.0.0.1:${server.port}${path}`;
}

afterEach(async () => {
  while (servers.length > 0) {
    const server = servers.pop();
    if (server) {
      await server.stop(true);
    }
  }
});

describe("mini integration", () => {
  test("uses default layout when no layout is provided", async () => {
    const server = mini({
      routes: {
        "/": page(() => "<main>Home</main>", {
          head: { title: "Home" },
        }),
      },
      port: 0,
    });
    servers.push(server);

    const response = await fetch(localTestUrl(server, "/"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("<html>");
    expect(body).toContain("<body");
    expect(body).toContain("<main><main>Home</main></main>");
  });

  test("uses provided layout for route rendering", async () => {
    const server = mini({
      routes: {
        "/": page(() => "<article>Custom</article>", {
          head: { title: "Custom" },
        }),
      },
      layout: layout(
        ({ page }) => `<section class=\"shell\">${page}</section>`,
      ),
      port: 0,
    });
    servers.push(server);

    const response = await fetch(localTestUrl(server, "/"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain(
      '<section class="shell"><article>Custom</article></section>',
    );
  });

  test("composes page routes and partial routes in one server", async () => {
    const server = mini({
      routes: {
        "/": page(() => "<main>Page</main>", {
          head: { title: "Page" },
        }),
      },
      partials: {
        greeting: partial(() => "<p>Hello</p>", { allowNonHtmx: true }),
      },
      port: 0,
    });
    servers.push(server);

    const pageResponse = await fetch(localTestUrl(server, "/"));
    const pageBody = await pageResponse.text();

    const partialResponse = await fetch(
      localTestUrl(server, "/partial/greeting"),
    );
    const partialBody = await partialResponse.text();

    expect(pageResponse.status).toBe(200);
    expect(pageBody).toContain("<main><main>Page</main></main>");

    expect(partialResponse.status).toBe(200);
    expect(partialBody).toBe("<p>Hello</p>");
  });

  test("injects global styles and scripts into full-page responses", async () => {
    const server = mini({
      routes: {
        "/": page(() => "<main>Assets</main>", {
          head: { title: "Assets" },
        }),
      },
      globalStyles: () => "body { color: red; }",
      scripts: () => "window.__miniIntegration=1;",
      port: 0,
    });
    servers.push(server);

    const fullResponse = await fetch(localTestUrl(server, "/"));
    const fullBody = await fullResponse.text();

    const htmxResponse = await fetch(localTestUrl(server, "/"), {
      headers: { "HX-Request": "true" },
    });
    const htmxBody = await htmxResponse.text();

    expect(fullResponse.status).toBe(200);
    expect(fullBody).toContain("<style>body{color:red}</style>");
    expect(fullBody).toContain("window.__miniIntegration=1");

    expect(htmxResponse.status).toBe(200);
    expect(htmxBody).not.toContain("window.__miniIntegration=1");
    expect(htmxBody).not.toContain("body{color:red}");
  });

  test("reports handled global stylesheet failures", async () => {
    const errors: Array<{ error: unknown; request: Request }> = [];
    const server = mini({
      routes: {
        "/": page(() => "<main>Assets</main>"),
      },
      globalStyles: () => {
        throw new Error("Stylesheet failed to load");
      },
      onError: (error, request) => {
        errors.push({ error, request });
      },
      port: 0,
    });
    servers.push(server);

    const response = await fetch(localTestUrl(server, "/"));

    expect(response.status).toBe(500);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.error).toBeInstanceOf(Error);
    expect((errors[0]?.error as Error).message).toBe(
      "Stylesheet failed to load",
    );
    expect(errors[0]?.request.url).toBe(localTestUrl(server, "/"));
  });
});
