import { describe, expect, test } from "bun:test";
import { layout } from "../../core/layout";
import { page } from "../../core/page";
import { buildPages } from "./build-pages";

const renderDocument = async ({ page: content }: { page: string }) =>
  `<document>${content}</document>`;

const layouts = {
  "*": layout(({ page: content }) => `<main id="app">${content}</main>`, {
    pageTarget: "#app",
  }),
  "/docs/*": layout(
    ({ page: content }) => `<section id="docs">${content}</section>`,
    { pageTarget: "#docs" },
  ),
};

describe("buildPages", () => {
  test("composes matching layouts into full-page documents", async () => {
    const handlers = buildPages(
      { "/docs/*": page(() => "<article>Guide</article>") },
      { layouts, renderDocument },
    );

    const response = await handlers["/docs/*"]!(
      new Request("http://localhost/docs/guide"),
    );

    expect(await response.text()).toBe(
      '<document><main id="app"><section id="docs"><article>Guide</article></section></main></document>',
    );
  });

  test("targets the innermost layout for compatible boosted navigation", async () => {
    const handlers = buildPages(
      { "/docs/*": page(() => "<article>Guide</article>") },
      { layouts, renderDocument },
    );

    const response = await handlers["/docs/*"]!(
      new Request("http://localhost/docs/next", {
        headers: {
          "HX-Boosted": "true",
          "HX-Current-URL": "http://localhost/docs/guide",
          "HX-Request": "true",
        },
      }),
    );

    expect(response.headers.get("HX-Retarget")).toBe("#docs");
    expect(response.headers.get("HX-Redirect")).toBeNull();
    expect(await response.text()).toBe("<article>Guide</article>");
  });

  test("uses a full navigation when boosted layout chains differ", async () => {
    const handlers = buildPages(
      { "/docs/*": page(() => "<article>Guide</article>") },
      { layouts, renderDocument },
    );

    const response = await handlers["/docs/*"]!(
      new Request("http://localhost/docs/guide?tab=api", {
        headers: {
          "HX-Boosted": "true",
          "HX-Current-URL": "http://localhost/",
          "HX-Request": "true",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("HX-Redirect")).toBe("/docs/guide?tab=api");
  });

  test("uses a full navigation when the current URL is missing or invalid", async () => {
    const handlers = buildPages(
      { "/docs/*": page(() => "<article>Guide</article>") },
      { layouts, renderDocument },
    );

    const response = await handlers["/docs/*"]!(
      new Request("http://localhost/docs/guide", {
        headers: { "HX-Boosted": "true", "HX-Request": "true" },
      }),
    );

    expect(response.headers.get("HX-Redirect")).toBe("/docs/guide");
  });

  test("uses the destination target for non-boosted HTMX requests", async () => {
    const handlers = buildPages(
      { "/docs/*": page(() => "<article>Guide</article>") },
      { layouts, renderDocument },
    );

    const response = await handlers["/docs/*"]!(
      new Request("http://localhost/docs/guide", {
        headers: { "HX-Request": "true" },
      }),
    );

    expect(response.headers.get("HX-Retarget")).toBe("#docs");
    expect(await response.text()).toBe("<article>Guide</article>");
  });
});
