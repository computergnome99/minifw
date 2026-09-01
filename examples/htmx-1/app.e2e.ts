/* eslint-disable unicorn/no-top-level-assignment-in-function */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { captureScreenshot } from "../capture-screenshot";
import { createWebView } from "../create-webview";

let server: ReturnType<typeof Bun.spawn> | undefined;

beforeAll(async () => {
  server = Bun.spawn(["bun", "examples/htmx-1/server.ts"], {
    stderr: "ignore",
    stdout: "ignore",
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch("http://127.0.0.1:3101");
      return;
    } catch {
      await Bun.sleep(100);
    }
  }

  throw new Error("HTMX 1 example server did not start");
});

afterAll(async () => {
  server?.kill();
  await server?.exited;
});

test("HTMX 1 swaps a MiniFW partial", async () => {
  await using view = createWebView();
  await view.navigate("http://127.0.0.1:3101");

  expect(
    (await view.evaluate("document.querySelector('h2')?.textContent")) as
      | string
      | undefined,
  ).toBe("HTMX 1 partials");
  expect(
    (await view.evaluate(
      "document.querySelector('[data-count]')?.textContent",
    )) as string | undefined,
  ).toBe("Count: 1");
  await captureScreenshot(view, "htmx-1", "initial");

  await view.click("button");

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const count = await view.evaluate(
      "document.querySelector('[data-count]')?.textContent",
    );
    if (count === "Count: 2") {
      await captureScreenshot(view, "htmx-1", "incremented");
      return;
    }
    await Bun.sleep(100);
  }

  throw new Error("HTMX did not swap the counter partial");
});

test("HTMX 1 promotes swapped partial styles to the document head", async () => {
  await using view = createWebView();
  await view.navigate("http://127.0.0.1:3101");

  expect(
    (await view.evaluate(
      "document.head.querySelectorAll('style[fwid]').length",
    )) as number,
  ).toBe(0);

  await view.click("[data-styled-partial-button]");

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const output = await view.evaluate(
      "document.querySelector('#styled-partial')?.textContent",
    );
    if (output === "Styled partial") break;
    await Bun.sleep(100);
  }

  expect(
    (await view.evaluate(
      "document.head.querySelectorAll('style[fwid]').length",
    )) as number,
  ).toBe(1);
});

test("HTMX 1 preserves the layout during boosted navigation", async () => {
  await using view = createWebView();
  await view.navigate("http://127.0.0.1:3101");

  await view.click("[data-product-link]");

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const product = await view.evaluate(
      "document.querySelector('[data-product-id]')?.textContent",
    );
    if (product === "Product widget-42") break;
    await Bun.sleep(100);
  }

  expect((await view.evaluate("location.pathname")) as string).toBe(
    "/products/widget-42",
  );
  expect(
    (await view.evaluate("document.querySelector('h1')?.textContent")) as
      | string
      | undefined,
  ).toBe("Example MiniFW App");
  expect(
    (await view.evaluate(
      "document.querySelector('[data-product-id]')?.textContent",
    )) as string | undefined,
  ).toBe("Product widget-42");
});

test("MiniFW passes Bun route parameters to page renderers", async () => {
  await using view = createWebView();
  await view.navigate("http://127.0.0.1:3101/products/widget-42");

  expect(
    (await view.evaluate(
      "document.querySelector('[data-product-id]')?.textContent",
    )) as string | undefined,
  ).toBe("Product widget-42");
  await captureScreenshot(view, "htmx-1", "product-widget-42");
});
