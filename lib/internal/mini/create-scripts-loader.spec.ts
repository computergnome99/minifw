import { describe, expect, test } from "bun:test";
import { createScriptsLoader } from "./create-scripts-loader";

describe("createScriptsLoader", () => {
  test("returns undefined when scripts are not configured", async () => {
    const load = createScriptsLoader(undefined);

    expect(await load()).toBeUndefined();
  });

  test("combines script entries in order", async () => {
    const load = createScriptsLoader([
      () => "window.__a = 1;",
      () => "window.__b = 2;",
    ]);

    const output = await load();

    expect(output).toContain("window.__a=1;");
    expect(output).toContain("window.__b=2;");
  });

  test("memoizes loading work", async () => {
    let calls = 0;
    const load = createScriptsLoader(() => {
      calls += 1;
      return "window.__memo = true;";
    });

    const first = await load();
    const second = await load();

    expect(first).toBe(second);
    expect(calls).toBe(1);
  });
});
