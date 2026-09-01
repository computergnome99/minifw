/* eslint-disable unicorn/no-top-level-assignment-in-function */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { captureScreenshot } from "../examples/capture-screenshot";
import { createWebView } from "../examples/create-webview";

let server: ReturnType<typeof Bun.spawn> | undefined;
const port = 3105;
const baseUrl = `http://127.0.0.1:${port}`;

beforeAll(async () => {
  server = Bun.spawn(["bun", "docs/index.ts"], {
    env: { ...process.env, DOCS_PORT: String(port) },
    stderr: "ignore",
    stdout: "ignore",
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(`${baseUrl}/docs`);
      return;
    } catch {
      await Bun.sleep(100);
    }
  }

  throw new Error("Documentation server did not start");
});

afterAll(async () => {
  server?.kill();
  await server?.exited;
});

test("documentation navigation uses static native disclosures", async () => {
  await using view = createWebView();
  await view.navigate(`${baseUrl}/docs`);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const tree = await view.evaluate(
      "document.querySelector('[data-docs-tree]')",
    );
    if (tree) break;
    await Bun.sleep(100);
  }

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree]')?.getAttribute('aria-label')",
    )) as string | undefined,
  ).toBe("Documentation sections");
  expect(
    (await view.evaluate(
      "document.querySelectorAll('[data-docs-tree] details > summary').length",
    )) as number,
  ).toBe(3);
  expect(
    (await view.evaluate(
      "getComputedStyle(document.querySelector('[data-docs-tree] summary')).display",
    )) as string,
  ).toBe("list-item");
  await view.evaluate(
    "document.querySelector('[data-docs-tree] summary')?.click()",
  );

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] details')?.hasAttribute('open')",
    )) as boolean | undefined,
  ).toBe(true);

  await view.evaluate(
    "document.querySelector('[data-docs-tree]')?.setAttribute('data-instance', 'initial')",
  );
  const settle = view.evaluate(
    "new Promise((resolve) => document.body.addEventListener('htmx:after:settle', () => { if (location.pathname === '/docs/core/page') resolve(null) }))",
  );
  await view.click('[data-docs-tree] a[href="/docs/core/page"]');
  await settle;

  expect((await view.evaluate("location.pathname")) as string).toBe(
    "/docs/core/page",
  );
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree]')?.getAttribute('data-instance')",
    )) as string | undefined,
  ).toBe("initial");
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] details')?.hasAttribute('open')",
    )) as boolean | undefined,
  ).toBe(true);
  expect(
    (await view.evaluate(
      "document.querySelector('#docs-page h1')?.textContent",
    )) as string | undefined,
  ).toBe("page()");
  await captureScreenshot(view, "docs", "nested-layout-navigation");

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] summary')?.hasAttribute('hx-get')",
    )) as boolean | undefined,
  ).toBe(false);
}, 15_000);
