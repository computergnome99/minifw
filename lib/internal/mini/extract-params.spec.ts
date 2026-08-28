import { describe, expect, test } from "bun:test";
import { extractParams } from "./extract-params";

describe("extractParams", () => {
  test("returns request params when present", () => {
    const req = new Request("http://localhost/users/alice") as Request & {
      params?: Record<string, string>;
    };
    req.params = { user: "alice" };

    expect(extractParams(req)).toEqual({ user: "alice" });
  });

  test("returns empty object when params are missing", () => {
    const req = new Request("http://localhost/");

    expect(extractParams(req)).toEqual({});
  });
});
