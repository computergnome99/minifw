import { describe, expect, test } from "bun:test";
import { extractParameters } from "./extract-parameters";

describe("extractParams", () => {
  test("returns request params when present", () => {
    const request = new Request("http://localhost/users/alice") as Request & {
      params?: Record<string, string>;
    };
    request.params = { user: "alice" };

    expect(extractParameters(request)).toEqual({ user: "alice" });
  });

  test("returns empty object when params are missing", () => {
    const request = new Request("http://localhost/");

    expect(extractParameters(request)).toEqual({});
  });
});
