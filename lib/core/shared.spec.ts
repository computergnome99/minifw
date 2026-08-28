import { describe, expect, test } from "bun:test";
import type { MiniContext, MiniHead } from "./shared";

describe("shared types", () => {
  test("MiniContext can represent request metadata shape", () => {
    const request = new Request("http://localhost/products/42");

    const context: MiniContext = {
      request,
      url: new URL(request.url),
      params: { id: "42" },
      isHtmx: true,
    };

    expect(context.params.id).toBe("42");
    expect(context.isHtmx).toBe(true);
  });

  test("MiniHead can represent optional page metadata", () => {
    const head: MiniHead = {
      title: "Products",
      description: "Browse products",
      canonical: "https://example.com/products/42",
      robots: "index,follow",
    };

    const values = Object.values(head).filter(Boolean);

    expect(values.length).toBe(4);
  });
});
