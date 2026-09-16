import { describe, expect, test } from "bun:test";
import { buildContext } from "./build-context";

describe("buildContext", () => {
  test("creates a full MiniContext from request", () => {
    const request = new Request("http://localhost/users/alice", {
      headers: { "HX-Request": "true" },
    }) as Bun.BunRequest;
    Object.defineProperty(request, "params", { value: { user: "alice" } });

    const context = buildContext(request, "/users/:user");

    expect(context.request).toBe(request);
    expect(context.url.pathname).toBe("/users/alice");
    expect(context.route).toBe("/users/:user");
    expect(context.params).toEqual({ user: "alice" });
    expect(context.isHtmx).toBe(true);
  });
});
