---
title: html
order: 23
tags: [html, template, markup]
---

# `html`

`html` is a tagged template helper for HTML strings. It preserves the template
content unchanged while giving editors template-aware syntax highlighting.

## Basic Markup

```ts
import { html } from "@calvinbonner/minifw/helpers";

const card = html`<article><h2>${title}</h2></article>`;
```

Use it in [pages](/docs/core/page), [partials](/docs/core/partial), and
[fragments](/docs/core/fragment) to compose markup with standard template
interpolation:

```ts
const list = html`<ul>
  ${each(products, (product) => `<li>${product.name}</li>`)}
</ul>`;
```

## Security

`html` does not escape interpolated values. Escape or sanitize all untrusted
content before inserting it into a template, including user input, remote data,
and query-string values. HTML safety is the caller's responsibility.

The helper does not parse, validate, or minify markup. MiniFW minifies rendered
[page](/docs/core/page) and [partial](/docs/core/partial) responses; see
[Minification](/docs/extra/minification). Use [css](/docs/helpers/css) for style
text rather than HTML.
