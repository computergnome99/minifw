---
title: each()
order: 21
tags: [array, iteration, rendering, list, template]
---

# `each()`

`each()` is a template helper which maps an array to strings and concatenates
the results. It is useful for rendering repeated HTML inside an
[html](/docs/helpers/html) template.

## Basic List Rendering

```ts
import { each, html } from "@calvinbonner/minifw/helpers";

const list = html`<ul>
  ${each(["Tea", "Coffee"], (item) => html`<li>${item}</li>`)}
</ul>`;
```

The callback receives the current item and zero-based index:

```ts
const links = each(
  pages,
  ({ href, title }, index) =>
    `<a data-position="${index}" href="${href}">${title}</a>`,
);
```

`each()` returns an empty string for an empty array. It does not add separators,
wrappers, escaping, or asynchronous handling; put any structure in the callback
and sanitize untrusted values before interpolating them.

Use [repeat()](/docs/helpers/repeat) when you need a fixed number of iterations
rather than values from an existing array. Both helpers work inside
[pages](/docs/core/page), [partials](/docs/core/partial), and
[fragments](/docs/core/fragment).
