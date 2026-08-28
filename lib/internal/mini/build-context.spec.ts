import { describe, expect, test } from "bun:test";
import { buildContext } from "./build-context";

describe("buildContext", () => {
  test("creates a full MiniContext from request", () => {
    const req = new Request("http://localhost/users/alice", {
      headers: { "HX-Request": "true" },
    }) as Request & { params?: Record<string, string> };
    req.params = { user: "alice" };

    const ctx = buildContext(req, "/users/:user");

    expect(ctx.request).toBe(req);
    expect(ctx.url.pathname).toBe("/users/alice");
    expect(ctx.route).toBe("/users/:user");
    expect(ctx.params).toEqual({ user: "alice" });
    expect(ctx.isHtmx).toBe(true);
  });
});
