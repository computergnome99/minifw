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

test("documentation treeview supports keyboard navigation and HTMX expansion", async () => {
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
      "document.querySelectorAll('[data-docs-tree] [role=treeitem][tabindex=\"0\"]').length",
    )) as number,
  ).toBe(1);
  await view.evaluate(
    "document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))",
  );

  await view.evaluate(
    "document.querySelector('[data-docs-tree] [role=treeitem]')?.focus()",
  );
  await view.evaluate(
    "document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))",
  );

  expect(
    (await view.evaluate("document.activeElement?.textContent?.trim()")) as
      | string
      | undefined,
  ).toBe("Formatting");

  await view.evaluate(
    "document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))",
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const expanded = await view.evaluate(
      "document.querySelector('[data-docs-tree] [aria-expanded]')?.getAttribute('aria-expanded')",
    );
    if (expanded === "true") break;
    await Bun.sleep(100);
  }

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] [aria-expanded]')?.getAttribute('aria-expanded')",
    )) as string | undefined,
  ).toBe("true");
  expect(
    (await view.evaluate("document.activeElement?.textContent?.trim()")) as
      | string
      | undefined,
  ).toBe("Formatting");

  await view.evaluate(
    "document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))",
  );

  expect(
    (await view.evaluate("document.activeElement?.textContent?.trim()")) as
      | string
      | undefined,
  ).toBe("Text formatting");
  await view.evaluate(
    "document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }))",
  );
  await view.evaluate(
    "document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }))",
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const expanded = await view.evaluate(
      "document.querySelector('[data-docs-tree] [aria-expanded]')?.getAttribute('aria-expanded')",
    );
    if (expanded === "false") break;
    await Bun.sleep(100);
  }

  expect(
    (await view.evaluate("document.activeElement?.textContent?.trim()")) as
      | string
      | undefined,
  ).toBe("Formatting");
}, 15_000);
