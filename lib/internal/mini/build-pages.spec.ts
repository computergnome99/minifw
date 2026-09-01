import { describe, expect, test } from "bun:test";
import { error, MiniHttpError } from "../../helpers/error";
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

    const response = await handlers["/"]!(new Request("http://localhost/"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("HX-Retarget")).toBeNull();
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

    const response = await handlers["/"]!(
      new Request("http://localhost/", {
        headers: { "HX-Request": "true" },
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("HX-Retarget")).toBe("main");
    expect(body).not.toContain("<html>");
    expect(body).toContain("<main>Hello</main>");
  });

  test("uses a configured page target for HTMX requests", async () => {
    const routes = { "/": page(() => "<p>Hello</p>") };
    const handlers = buildPages(
      routes,
      layout(({ page }) => `<section id="view">${page}</section>`, {
        pageTarget: "#view",
      }),
    );

    const response = await handlers["/"]!(
      new Request("http://localhost/", {
        headers: { "HX-Request": "true" },
      }),
    );

    expect(response.headers.get("HX-Retarget")).toBe("#view");
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

  test("propagates MiniFW HTTP errors", async () => {
    const routes = {
      "/": page(() => {
        error(418, "teapot");
      }),
    };
    const handlers = buildPages(
      routes,
      layout(({ page }) => page),
    );

    await expect(() =>
      handlers["/"]!(new Request("http://localhost/")),
    ).toThrow(MiniHttpError);
  });

  test("propagates unexpected errors", async () => {
    const handlers = buildPages(
      {
        "/": page(() => {
          throw new Error("boom");
        }),
      },
      layout(({ page }) => page),
    );

    await expect(() =>
      handlers["/"]!(new Request("http://localhost/")),
    ).toThrow("boom");
  });
});
