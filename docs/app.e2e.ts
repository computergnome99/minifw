/* eslint-disable unicorn/no-top-level-assignment-in-function */
import { afterAll, beforeAll, expect, test } from "bun:test";
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

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] summary')?.hasAttribute('hx-get')",
    )) as boolean | undefined,
  ).toBe(false);
}, 15_000);
