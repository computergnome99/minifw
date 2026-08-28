import { describe, expect, test } from "bun:test";
import { isHtmx } from "./is-htmx";

describe("isHtmx", () => {
  test("returns true when HX-Request header is true", () => {
    const request = new Request("http://localhost/", {
      headers: { "HX-Request": "true" },
    });

    const result = isHtmx(request);

    expect(result).toBe(true);
  });

  test("returns false when HX-Request header is missing", () => {
    const request = new Request("http://localhost/");

    const result = isHtmx(request);

    expect(result).toBe(false);
  });

  test("returns false when HX-Request header is not true", () => {
    const request = new Request("http://localhost/", {
      headers: { "HX-Request": "false" },
    });

    const result = isHtmx(request);

    expect(result).toBe(false);
  });
});
