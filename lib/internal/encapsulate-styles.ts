import { createHash } from "node:crypto";
import { parseHTML } from "linkedom";
import { transform } from "lightningcss";
import type { SelectorComponent, SelectorList } from "lightningcss";

/** Attribute name stamped on every HTML element and used in every CSS selector. */
export const SCOPE_ATTR = "fwsc";

/** Attribute used on injected <style> tags for deterministic dedupe IDs. */
export const STYLE_ID_ATTR = "fwid";

/** Selector for injected style tags that carry a deterministic dedupe ID. */
export const STYLE_ID_SELECTOR = "style[fwid]";

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
 * Inject a `[fwsc="<id>"]` component into every compound selector inside a
 * selector list. The attribute is inserted immediately before any trailing
 * pseudo-element so that `a::before` becomes `a[fwsc="x"]::before`. Nesting
 * combinators (`&`) are left alone; nested rules are processed independently by
 * the lightningcss Rule visitor.
 *
 * @param selectors
 * @param id
 */
function injectIntoSelectorList(
  selectors: SelectorList,
  id: string,
): SelectorList {
  const attributeComponent: SelectorComponent = {
    type: "attribute",
    name: SCOPE_ATTR,
    operation: { operator: "equal", value: id },
  };

  return selectors.map((selector) => {
    const result: SelectorComponent[] = [];
    let compoundStart = 0;

    const flushCompound = (end: number) => {
      const compound = selector.slice(compoundStart, end);

      // Find the index of the first trailing pseudo-element (if any).
      let insertAt = compound.length;
      for (let index = compound.length - 1; index >= 0; index--) {
        if (compound[index]!.type === "pseudo-element") {
          insertAt = index;
        } else {
          break;
        }
      }

      result.push(
        ...compound.slice(0, insertAt),
        attributeComponent,
        ...compound.slice(insertAt),
      );
    };

    for (const [index, element] of selector.entries()) {
      const component = element!;
      if (component.type === "combinator") {
        flushCompound(index);
        result.push(component);
        compoundStart = index + 1;
      }
    }
    flushCompound(selector.length);

    return result;
  });
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
    visitor: {
      Rule: {
        style(rule) {
          return {
            ...rule,
            value: {
              ...rule.value,
              selectors: injectIntoSelectorList(rule.value.selectors, id),
            },
          };
        },
      },
    },
  });
  return Buffer.from(code).toString();
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
