import { describe, expect, test } from "bun:test";
import { createGlobalStylesLoader } from "./create-global-styles-loader";

describe("createGlobalStylesLoader", () => {
  test("returns undefined when styles are not configured", async () => {
    const load = createGlobalStylesLoader(undefined);

    expect(await load()).toBeUndefined();
  });

  test("combines and minifies style entries", async () => {
    const load = createGlobalStylesLoader([
      () => ":root { --tone: #111; }",
      () => "body { color: var(--tone); }",
    ]);

    const output = await load();

    expect(output).toBe(":root{--tone:#111}body{color:var(--tone)}");
  });

  test("memoizes loading work", async () => {
    let calls = 0;
    const load = createGlobalStylesLoader(() => {
      calls += 1;
      return "body { color: red; }";
    });

    const first = await load();
    const second = await load();

    expect(first).toBe(second);
    expect(calls).toBe(1);
  });
});
