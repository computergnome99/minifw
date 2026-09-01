import { createHash } from "node:crypto";
import { parseHTML } from "linkedom";
import { transform } from "lightningcss";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

/** Attribute name stamped on every HTML element and used in every CSS selector. */
export const SCOPE_ATTR = "fwsc";

/** Attribute used on injected <style> tags for deterministic dedupe IDs. */
export const STYLE_ID_ATTR = "fwid";

/** Selector for injected style tags that carry a deterministic dedupe ID. */
export const STYLE_ID_SELECTOR = "style[fwid]";

const LEGACY_PSEUDO_ELEMENTS = new Set([
  ":after",
  ":before",
  ":first-letter",
  ":first-line",
]);

/**
 * Derive a short, deterministic scope ID from a route string by hashing it with
 * SHA-256, encoding the digest as URL-safe base64, and taking the first 10
 * characters (60 bits — ~1.15 quintillion possible IDs).
 *
 * @param route
 */
export function scopeId(route: string): string {
  return createHash("sha256").update(route).digest("base64url").slice(0, 10);
}

/**
 * Inject a `[fwsc="<id>"]` attribute into every compound selector. The
 * attribute is inserted immediately before a trailing pseudo-element so that
 * `a::before` becomes `a[fwsc="x"]::before`.
 *
 * @param selector
 * @param id
 */
function scopeSelector(selector: string, id: string): string {
  return selectorParser((selectors) => {
    selectors.each((selector_) => {
      let compoundStart = 0;

      const scopeCompound = (end: number) => {
        const compound = selector_.nodes.slice(compoundStart, end);
        if (compound.length === 0) return;

        const pseudoElement = compound.findLast(
          (node) =>
            node.type === "pseudo" &&
            (node.value.startsWith("::") ||
              LEGACY_PSEUDO_ELEMENTS.has(node.value)),
        );
        const attribute = selectorParser.attribute({
          attribute: SCOPE_ATTR,
          operator: "=",
          quoteMark: '"',
          raws: { value: `"${id}"` },
          value: id,
        });

        if (pseudoElement) {
          // eslint-disable-next-line unicorn/prefer-modern-dom-apis -- Selector parser nodes are not DOM nodes.
          selector_.insertBefore(pseudoElement, attribute);
        } else {
          selector_.insertAfter(compound.at(-1)!, attribute);
        }
      };

      for (const [index, node] of selector_.nodes.entries()) {
        if (node.type !== "combinator") {
          continue;
        }

        scopeCompound(index);
        compoundStart = index + 1;
      }
      scopeCompound(selector_.nodes.length);
    });
  }).processSync(selector);
}

/** @param rule */
function isKeyframeRule(rule: postcss.Rule): boolean {
  return (
    rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")
  );
}

/**
 * Scope a raw CSS string by injecting the attribute into every selector.
 *
 * @param css
 * @param id
 */
function scopeCss(css: string, id: string): string {
  const { code } = transform({
    filename: "component.css",
    code: Buffer.from(css),
    minify: true,
  });
  const root = postcss.parse(Buffer.from(code).toString());

  root.walkRules((rule) => {
    if (isKeyframeRule(rule)) return;
    rule.selector = scopeSelector(rule.selector, id);
  });

  const scopedCss = root.toString();
  return Buffer.from(
    transform({
      filename: "component.css",
      code: Buffer.from(scopedCss),
      minify: true,
    }).code,
  ).toString();
}

/**
 * Stamp `fwsc="<id>"` onto every element in the markup and inject
 * `[fwsc="<id>"]` into every CSS selector — the same technique Angular uses for
 * component style encapsulation.
 *
 * The scope ID is a base64url encoding of the route, keeping it short and
 * deterministic without introducing a separate ID system.
 *
 * Only call this function when both `css` and `route` are non-empty; the guard
 * belongs in the caller.
 *
 * @param markup The rendered HTML string returned by the component's render fn.
 * @param css The raw CSS string returned by the component's style fn.
 * @param route The route used as the deterministic scoping ID.
 * @returns The scoped markup and transformed CSS strings.
 */
export function encapsulateStyles(
  markup: string,
  css: string,
  route: string,
): { markup: string; css: string } {
  const id = scopeId(route);

  const { document } = parseHTML(
    `<!doctype html><html><head></head><body>${markup}</body></html>`,
  );

  for (const element of document.body.querySelectorAll("*")) {
    (element as Element).setAttribute(SCOPE_ATTR, id);
  }

  return {
    markup: document.body.innerHTML,
    css: scopeCss(css, id),
  };
}
