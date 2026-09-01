---
title: css
order: 20
tags: [css, template, styles]
---

# `css`

`css` is a tagged template helper for CSS strings. It returns the raw template
content unchanged while giving editors CSS-aware syntax highlighting.

## Use With Scoped Styles

```ts
import { page } from "@calvinbonner/minifw/core";
import { css, html } from "@calvinbonner/minifw/helpers";

const notice = page(
  () => html`<p class="notice">Saved</p>`,
  () => css`
    .notice {
      color: green;
    }
  `,
);
```

Pass the result to a [page()](/docs/core/page) or
[partial()](/docs/core/partial) style function to have MiniFW scope it to that
primitive's rendered markup. See
[Style Encapsulation](/docs/extra/style-encapsulation).

## Interpolation

`css` supports standard template interpolation:

```ts
const accent = "seagreen";
const styles = css`
  .notice {
    color: ${accent};
  }
`;
```

The helper does not parse, validate, escape, or minify CSS itself. MiniFW
minifies page, partial, and global CSS as part of response rendering; see
[Minification](/docs/extra/minification). Use [html](/docs/helpers/html) for
markup rather than CSS text.
