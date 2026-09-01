import { expect, test } from "bun:test";
import { isMiniRedirect, MiniRedirect, redirectTo } from "./redirect-to";

test("redirectTo throws a redirect with the requested destination and status", () => {
  const act = () => redirectTo("/docs/getting-started", 301);

  expect(act).toThrow(MiniRedirect);

  try {
    act();
  } catch (error) {
    expect(isMiniRedirect(error)).toBe(true);
    expect((error as MiniRedirect).response.status).toBe(301);
    expect((error as MiniRedirect).response.headers.get("location")).toBe(
      "/docs/getting-started",
    );
  }
});

test("redirectTo defaults to a temporary redirect", () => {
  expect(() => redirectTo("/docs")).toThrow(MiniRedirect);
});
