/* eslint-disable unicorn/no-top-level-assignment-in-function */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { captureScreenshot } from "../capture-screenshot";
import { createWebView } from "../create-webview";

let server: ReturnType<typeof Bun.spawn> | undefined;

beforeAll(async () => {
  server = Bun.spawn(
    ["node", "--import", "tsx", "examples/express/server.ts"],
    {
      stderr: "inherit",
      stdout: "ignore",
    },
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch("http://127.0.0.1:3106/products/espresso");
      return;
    } catch {
      await Bun.sleep(100);
    }
  }

  throw new Error("Express example server did not start");
});

afterAll(async () => {
  server?.kill();
  await server?.exited;
});

test("Express on Node renders MiniFW pages without mini", async () => {
  await using view = createWebView();
  await view.navigate("http://127.0.0.1:3106/products/espresso");

  expect(
    (await view.evaluate(
      "document.querySelector('[data-product-name]')?.textContent",
    )) as string | undefined,
  ).toBe("Product espresso");
  await captureScreenshot(view, "express", "product-espresso");
});
