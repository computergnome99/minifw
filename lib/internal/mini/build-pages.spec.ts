import { describe, expect, test } from "bun:test";
import { error } from "../../helpers/error";
import { layout } from "../../core/layout";
import { page } from "../../core/page";
import { buildPages } from "./build-pages";

describe("buildPages", () => {
  test("renders full HTML via layout for non-HTMX requests", async () => {
    const routes = {
      "/": page(() => "<main>Hello</main>", { head: { title: "Home" } }),
    };
    const handlers = buildPages(
      routes,
      layout(({ page }) => page),
    );

    const res = await handlers["/"]!(new Request("http://localhost/"));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(body).toContain("<html>");
    expect(body).toContain("<main>Hello</main>");
  });

  test("bypasses layout for HTMX requests", async () => {
    const routes = {
      "/": page(() => "<main>Hello</main>", { head: { title: "Home" } }),
    };
    const handlers = buildPages(
      routes,
      layout(({ page }) => page),
    );

    const res = await handlers["/"]!(
      new Request("http://localhost/", {
        headers: { "HX-Request": "true" },
      }),
    );
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(body).not.toContain("<html>");
    expect(body).toContain("<main>Hello</main>");
  });

  test("handles page caching when enabled", async () => {
    let calls = 0;
    const routes = {
      "/": page(
        () => {
          calls += 1;
          return `<main>${calls}</main>`;
        },
        { cache: true },
      ),
    };
    const handlers = buildPages(
      routes,
      layout(({ page }) => page),
    );

    const first = await handlers["/"]!(new Request("http://localhost/"));
    const second = await handlers["/"]!(new Request("http://localhost/"));

    expect(await first.text()).toContain("<main>1</main>");
    expect(await second.text()).toContain("<main>1</main>");
    expect(calls).toBe(1);
  });

  test("maps thrown HTTP errors to response status", async () => {
    const routes = {
      "/": page(() => {
        error(418, "teapot");
      }),
    };
    const handlers = buildPages(
      routes,
      layout(({ page }) => page),
    );

    const res = await handlers["/"]!(new Request("http://localhost/"));

    expect(res.status).toBe(418);
    expect(await res.text()).toBe("teapot");
  });
});
