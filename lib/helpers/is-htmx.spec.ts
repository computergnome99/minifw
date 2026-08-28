import { describe, expect, test } from "bun:test";
import { isHtmx } from "./is-htmx";

describe("isHtmx", () => {
  test("returns true when HX-Request header is true", () => {
    // Arrange
    const req = new Request("http://localhost/", {
      headers: { "HX-Request": "true" },
    });

    // Act
    const result = isHtmx(req);

    // Assert
    expect(result).toBe(true);
  });

  test("returns false when HX-Request header is missing", () => {
    // Arrange
    const req = new Request("http://localhost/");

    // Act
    const result = isHtmx(req);

    // Assert
    expect(result).toBe(false);
  });

  test("returns false when HX-Request header is not true", () => {
    // Arrange
    const req = new Request("http://localhost/", {
      headers: { "HX-Request": "false" },
    });

    // Act
    const result = isHtmx(req);

    // Assert
    expect(result).toBe(false);
  });
});
