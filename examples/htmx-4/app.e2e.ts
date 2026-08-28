/* eslint-disable unicorn/no-top-level-assignment-in-function */
import { afterAll, beforeAll, expect, test } from "bun:test";

let server: ReturnType<typeof Bun.spawn> | undefined;

beforeAll(async () => {
  server = Bun.spawn(["bun", "examples/htmx-4/server.ts"], {
    stderr: "ignore",
    stdout: "ignore",
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch("http://127.0.0.1:3104");
      return;
    } catch {
      await Bun.sleep(100);
    }
  }

  throw new Error("HTMX 4 example server did not start");
});

afterAll(async () => {
  server?.kill();
  await server?.exited;
});

test("HTMX 4 inherits MiniFW's default boosted navigation", async () => {
  await using view = new Bun.WebView({
    backend: { type: "chrome", url: false },
  });
  await view.navigate("http://127.0.0.1:3104");

  expect(
    (await view.evaluate(
      "document.body.getAttribute('hx-boost:inherited')",
    )) as string | undefined,
  ).toBe("true");

  const settle = view.evaluate(
    "new Promise((resolve) => document.body.addEventListener('htmx:after:settle', resolve, { once: true }))",
  );
  await view.click("[data-about-link]");
  await settle;

  expect((await view.evaluate("location.pathname")) as string).toBe("/about");
  expect(
    (await view.evaluate("document.querySelector('h1')?.textContent")) as
      | string
      | undefined,
  ).toBe("About HTMX 4");
  expect(
    (await view.evaluate(
      "document.head.querySelectorAll('style[fwid]').length",
    )) as number,
  ).toBe(2);
});
