---
title: Style Encapsulation
order: 31
tags: [css, styles, encapsulation, scope]
---

# Style Encapsulation

A [page()](/docs/core/page) or [partial()](/docs/core/partial) style function
scopes its CSS to that primitive's rendered markup. This keeps component styles
from leaking into unrelated page content.

## Add Scoped Styles

```ts
import { partial } from "@calvinbonner/minifw/core";
import { css, html } from "@calvinbonner/minifw/helpers";

const notice = partial(
  () => html`<p class="notice">Saved</p>`,
  () => css`
    .notice {
      color: green;
    }
  `,
);
```

MiniFW marks each rendered element with a deterministic route-based scope and
rewrites CSS selectors to match only elements carrying that scope. It applies
this to nested CSS selectors as well as ordinary rules.

## Response Placement

For full-page responses, [mini()](/docs/core/mini) extracts scoped style blocks
from composed page markup and places them in the document head. A
[partial()](/docs/core/partial) or HTMX page response includes its scoped style
alongside the returned markup.

After an HTMX swap, MiniFW's [runtime](/docs/extra/runtime) promotes any new
scoped styles into the document head and deduplicates them by a stable route
identifier. This preserves styles for subsequent interactions without adding the
same block repeatedly.

## Boundaries

Only CSS supplied through a page or partial style function is scoped. Global
styles configured through [mini()](/docs/core/mini) remain global, which makes
them appropriate for resets, tokens, typography, and shared layout rules.

Use [css](/docs/helpers/css) to author style strings. MiniFW minifies scoped CSS
before sending it; see [Minification](/docs/extra/minification).
