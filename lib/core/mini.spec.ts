import { afterEach, describe, expect, test } from "bun:test";
import { error, isMiniError } from "../helpers/error";
import { redirectTo } from "../helpers/redirect-to";
import { layout } from "./layout";
import { mini } from "./mini";
import { page } from "./page";
import { partial } from "./partial";
import { redirect } from "./redirect";

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

  test("passes native Bun routes directly to Bun.serve", async () => {
    const server = mini({
      routes: {
        "/native": () => new Response("Native route"),
        "/redirect": redirect("/native", 301),
      },
      port: 0,
    });
    servers.push(server);

    const nativeResponse = await fetch(localTestUrl(server, "/native"));
    const redirectResponse = await fetch(localTestUrl(server, "/redirect"), {
      redirect: "manual",
    });

    expect(await nativeResponse.text()).toBe("Native route");
    expect(redirectResponse.status).toBe(301);
    expect(redirectResponse.headers.get("location")).toBe("/native");
  });

  test("returns render-time redirects", async () => {
    const server = mini({
      routes: {
        "/account": page(() => redirectTo("/login", 303)),
      },
      port: 0,
    });
    servers.push(server);

    const response = await fetch(localTestUrl(server, "/account"), {
      redirect: "manual",
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
  });

  test("returns redirects raised while rendering a layout", async () => {
    const server = mini({
      routes: { "/account": page(() => "<main>Account</main>") },
      layout: layout(() => redirectTo("/maintenance", 307)),
      port: 0,
    });
    servers.push(server);

    const response = await fetch(localTestUrl(server, "/account"), {
      redirect: "manual",
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/maintenance");
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

  test("passes MiniFW errors to Bun's error handler", async () => {
    const server = mini({
      routes: {
        "/": page(() => {
          error(418, "teapot");
        }),
      },
      error: (caught) => {
        if (isMiniError(caught)) {
          return new Response(caught.message, { status: caught.status });
        }

        return new Response("Internal Server Error", { status: 500 });
      },
      port: 0,
    });
    servers.push(server);

    const response = await fetch(localTestUrl(server, "/"));

    expect(response.status).toBe(418);
    expect(await response.text()).toBe("teapot");
  });
});
