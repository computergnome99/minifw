import { describe, expect, test } from "bun:test";
import { fragment } from "./fragment";

const renderName = ({ name }: { name: string }) => `Hello ${name}`;

describe("fragment", () => {
  test("returns the provided render function", () => {
    const result = fragment(renderName);

    expect(result).toBe(renderName);
  });

  test("renders with props", async () => {
    const view = fragment(({ count }: { count: number }) => `Count: ${count}`);

    const output = await view({ count: 3 });

    expect(output).toBe("Count: 3");
  });

  test("supports async render functions", async () => {
    const view = fragment(async ({ value }: { value: string }) => {
      return `Async ${value}`;
    });

    const output = await view({ value: "ok" });

    expect(output).toBe("Async ok");
  });
});
