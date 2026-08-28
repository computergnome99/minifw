import { describe, expect, test } from "bun:test";
import { SCOPE_ATTR, encapsulateStyles, scopeId } from "./encapsulate-styles";

describe("encapsulateStyles", () => {
  test("adds scope attribute to every element in markup", () => {
    const markup = `<div><p>Hello</p></div>`;
    const css = `p { color: red; }`;
    const route = "/about";
    const id = scopeId(route);

    const { markup: scopedMarkup } = encapsulateStyles(markup, css, route);

    expect(scopedMarkup).toContain(`${SCOPE_ATTR}="${id}"`);
    const matches = scopedMarkup.match(new RegExp(SCOPE_ATTR, "g")) ?? [];
    expect(matches.length).toBe(2);
  });

  test("adds scope attribute to every element across multiple roots", () => {
    const markup = `<h1>Title</h1><p>Body</p>`;
    const css = `h1 { font-size: 2em; }`;
    const route = "/home";
    const id = scopeId(route);

    const { markup: scopedMarkup } = encapsulateStyles(markup, css, route);

    const matches = scopedMarkup.match(new RegExp(SCOPE_ATTR, "g")) ?? [];
    expect(matches.length).toBe(2);
    expect(scopedMarkup).toContain(`${SCOPE_ATTR}="${id}"`);
  });

  test("injects attribute selector into every CSS rule selector", () => {
    const markup = `<div></div>`;
    const css = `h1 { color: red; }\np { margin: 0; }`;
    const route = "/page";
    const id = scopeId(route);

    const { css: scopedCss } = encapsulateStyles(markup, css, route);

    expect(scopedCss).toContain(`h1[${SCOPE_ATTR}="${id}"]`);
    expect(scopedCss).toContain(`p[${SCOPE_ATTR}="${id}"]`);
  });

  test("injects attribute selector into nested CSS selectors", () => {
    const markup = `<section></section>`;
    const css = `.card {\n  color: red;\n\n  & .title {\n    color: blue;\n  }\n}`;
    const route = "/nested";
    const id = scopeId(route);

    const { css: scopedCss } = encapsulateStyles(markup, css, route);

    expect(scopedCss).toContain(`.card[${SCOPE_ATTR}="${id}"]`);
    expect(scopedCss).toContain(".title");
  });

  test("leaves text-only markup unchanged, still scopes CSS", () => {
    const markup = `Hello world`;
    const css = `h1 { color: red; }`;
    const route = "/text";
    const id = scopeId(route);

    const { markup: scopedMarkup, css: scopedCss } = encapsulateStyles(
      markup,
      css,
      route,
    );

    expect(scopedMarkup).toBe("Hello world");
    expect(scopedCss).toContain(`h1[${SCOPE_ATTR}="${id}"]`);
  });

  test("uses route as the deterministic scoping ID", () => {
    const route = "/partial/user-card";

    const first = encapsulateStyles("<div></div>", "p{}", route);
    const second = encapsulateStyles("<div></div>", "p{}", route);

    expect(first.markup).toBe(second.markup);
    expect(first.css).toBe(second.css);
  });

  test("scopeId produces a SHA-256 base64url hash of the route", () => {
    expect(scopeId("/about")).toBe("l5vdxKjKr9");
    expect(scopeId("/partial/user")).toBe("GpWXCCnzB8");
    // IDs must not contain base64 padding or URL-unsafe characters
    expect(scopeId("/about")).not.toMatch(/[+/=]/);
  });
});
