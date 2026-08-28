import { describe, expect, test } from "bun:test";
import { minify, minifyCss, minifyHtml } from "./minify";

describe("minify", () => {
  test("minifyCss handles nested selectors", () => {
    const input = `
      .card {
        color: red;

        & .title {
          color: blue;
        }
      }
    `;

    const output = minifyCss(input);

    expect(output).toContain(".card");
    expect(output).toContain(".title");
    expect(output).not.toContain("\n");
  });

  test("minifyHtml minifies inline style blocks and markup", async () => {
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

    const output = await minifyHtml(input);

    expect(output).toContain("<style>");
    expect(output).toContain(".card");
    expect(output).toContain(".title");
    expect(output).toContain("hello world");
    expect(output).not.toContain("remove me");
  });

  test("minify helper exposes html and css minifiers", async () => {
    const cssOutput = minify.css(".box { color: red; }");
    const htmlOutput = await minify.html("<div>  hi </div>");

    expect(cssOutput).toBe(".box{color:red}");
    expect(htmlOutput).toBe("<div>hi</div>");
  });
});
