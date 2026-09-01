---
title: layout()
order: 12
tags: [layout, document, head, htmx]
---

# `layout()`

`layout()` creates the shared document shell for your MiniFW application. It
wraps the initial request for every [page()](/docs/core/page) with the document
elements that do not need to be sent again: `<!DOCTYPE html>`, `<html>`,
`<head>`, `<body>`, navigation, scripts, and other application chrome.

Your body function receives the already-rendered page markup through `page`.

## Basic Layout

```ts
import { layout } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const appLayout = layout(({ page }) => html`<main>${page}</main>`);
```

Use it when starting the server:

```ts
import { layout, mini, page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const appLayout = layout(
  ({ page }) => html`
    <header><a href="/">MiniFW</a></header>
    <main>${page}</main>
  `,
);

const server = mini({
  layout: appLayout,
  routes: {
    "/": page(() => html`<h1>Home</h1>`),
    "/about": page(() => html`<h1>About</h1>`),
  },
});
```

MiniFW generates the surrounding document and uses a page's `head` option for
the title, description, canonical URL, and robots metadata. The layout function
only defines the markup placed inside the generated `<body>`.

## Extra Head Content

Pass a second function to append application-level tags to `<head>`. It receives
the same `page`, `context`, and page metadata as the body function.

```ts
const appLayout = layout(
  ({ page }) => html`<main id="app">${page}</main>`,
  () => html`<link rel="stylesheet" href="/fonts.css" />`,
);
```

This is a good place for site-wide font, analytics, or integration tags. Put
route-specific metadata in that route's [page()](/docs/core/page) options
instead.

## Configuration

The optional layout options configure HTMX, the boosted-navigation target, body
attributes, and MiniFW's scoped-style runtime.

```ts
const appLayout = layout(
  ({ page }) => html`<main id="content">${page}</main>`,
  {
    htmx: { type: "cdn", version: "2.0.4" },
    pageTarget: "#content",
    bodyArguments: { class: "site", "data-theme": "light" },
  },
);
```

Without an `htmx` option, MiniFW includes its default HTMX script. Use
`htmx: { type: "local", loadFn }` to inline a locally loaded HTMX build. Set
`disableRuntime: true` only when your application manages scoped styles from
HTMX swaps itself.

## Initial And Boosted Requests

The layout is deliberately sent only for a normal, initial page request. MiniFW
adds `hx-boost="true"` to the generated `<body>`, so same-origin links and forms
can use HTMX after the document has loaded.

| Request                                             | Server response                                                             | Browser update                                      |
| :-------------------------------------------------- | :-------------------------------------------------------------------------- | :-------------------------------------------------- |
| Initial visit to `/about`                           | Full document: layout, page markup, head tags, scripts, and styles          | Browser loads a new document                        |
| Click to `/about` after the initial page has loaded | Only the [page()](/docs/core/page) markup and applicable page head metadata | HTMX swaps the configured `pageTarget`              |
| Explicit HTMX request                               | Only the [page()](/docs/core/page) markup and applicable page head metadata | HTMX applies the request's target and swap settings |

For a boosted request, HTMX sends `HX-Request: true`. MiniFW detects that
header, skips `layout()`, and adds `HX-Retarget` with the layout's `pageTarget`.
The default target is `main`; use `pageTarget` when the element containing page
content has a different selector.

This keeps the shared shell in the browser while sending only the markup that
changed. The initial response establishes the document, navigation, scripts, and
global styles once. Subsequent boosted navigation transfers the next page's
content instead of repeating that stable markup on every request.

## Scoped Styles

Page-scoped styles are extracted from full-page markup and added to `<head>`.
When HTMX receives a later page response, MiniFW's runtime promotes any new
scoped styles into the existing document head and avoids duplicates.

Layouts are application-level infrastructure. Keep route-specific content in a
page or fragment instead.
