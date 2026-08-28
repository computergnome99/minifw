import { describe, expect, test } from "bun:test";
import { minify, minifyCss, minifyHtml } from "./minify";

describe("minify", () => {
  test("minifyCss handles nested selectors", () => {
    // Arrange
    const input = `
      .card {
        color: red;

        & .title {
          color: blue;
        }
      }
    `;

    // Act
    const output = minifyCss(input);

    // Assert
    expect(output).toContain(".card");
    expect(output).toContain(".title");
    expect(output).not.toContain("\n");
  });

  test("minifyHtml minifies inline style blocks and markup", async () => {
    // Arrange
    const input = `
      <div>
        <style>
          .card {
            color: red;

            & .title {
              color: blue;
            }
          }
        </style>
        hello   world
      </div>
      <!-- remove me -->
    `;

    // Act
    const output = await minifyHtml(input);

    // Assert
    expect(output).toContain("<style>");
    expect(output).toContain(".card");
    expect(output).toContain(".title");
    expect(output).toContain("hello world");
    expect(output).not.toContain("remove me");
  });

  test("minify helper exposes html and css minifiers", async () => {
    // Act
    const cssOutput = minify.css(".box { color: red; }");
    const htmlOutput = await minify.html("<div>  hi </div>");

    // Assert
    expect(cssOutput).toBe(".box{color:red}");
    expect(htmlOutput).toBe("<div>hi</div>");
  });
});
