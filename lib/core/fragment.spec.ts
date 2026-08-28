import { describe, expect, test } from "bun:test";
import { fragment } from "./fragment";

describe("fragment", () => {
  test("returns the provided render function", () => {
    // Arrange
    const render = ({ name }: { name: string }) => `Hello ${name}`;

    // Act
    const result = fragment(render);

    // Assert
    expect(result).toBe(render);
  });

  test("renders with props", async () => {
    // Arrange
    const view = fragment(({ count }: { count: number }) => `Count: ${count}`);

    // Act
    const output = await view({ count: 3 });

    // Assert
    expect(output).toBe("Count: 3");
  });

  test("supports async render functions", async () => {
    // Arrange
    const view = fragment(async ({ value }: { value: string }) => {
      return `Async ${value}`;
    });

    // Act
    const output = await view({ value: "ok" });

    // Assert
    expect(output).toBe("Async ok");
  });
});
