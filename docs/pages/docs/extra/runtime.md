---
title: Runtime
order: 33
tags: [runtime, htmx, styles, browser]
---

# Runtime

MiniFW includes a small browser runtime in full-page
[layouts](/docs/core/layout). Its only job is to keep scoped CSS available after
HTMX swaps.

## Why It Exists

A [partial()](/docs/core/partial) or boosted [page()](/docs/core/page) response
may contain a scoped `<style>` block needed by its new markup. After HTMX swaps
that markup into the existing document, the runtime moves the style into the
document head.

Each scoped style has a stable route-derived identifier. The runtime checks that
identifier before adding a style, avoiding duplicates across repeated swaps.

## Configuration

The runtime is enabled by default. Set `disableRuntime: true` in `layout()`
options when an application handles swapped scoped styles itself:

```ts
const appLayout = layout(({ page }) => `<main>${page}</main>`, {
  disableRuntime: true,
});
```

Disabling it does not stop CSS scoping or style generation. It only removes the
browser-side promotion and deduplication step, so your application must ensure
styles from HTMX responses remain available.

For the full request lifecycle, see [layout()](/docs/core/layout). For selector
rewriting and style placement, see
[Style Encapsulation](/docs/extra/style-encapsulation).
