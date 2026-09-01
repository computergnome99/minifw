---
title: mini()
order: 10
tags: [server, routes, bun, htmx]
---

# `mini()`

`mini()` starts a Bun server with MiniFW page rendering, route layouts, and HTMX
navigation. Bun server options remain at the top level; MiniFW document and
browser settings belong in `config`.

## Complete Example

```ts
import {
  layout,
  mini,
  page,
  partial,
  redirect,
} from "@calvinbonner/minifw/core";
import { html, isMiniError } from "@calvinbonner/minifw/helpers";

const appLayout = layout(
  ({ page }) => html`
    <header><a href="/">MiniFW</a></header>
    <main id="app-page">${page}</main>
  `,
  { pageTarget: "#app-page" },
);

const home = page(() => html`<h1>Welcome to MiniFW</h1>`, {
  head: { title: "Home" },
});

const clock = partial(() => html`<time>${new Date().toISOString()}</time>`, {
  allowNonHtmx: true,
});

const server = mini({
  port: 3000,
  layouts: { "*": appLayout },
  routes: {
    "/": home,
    "/health": () => new Response("OK"),
    "/docs": redirect("/docs/getting-started", 301),
  },
  partials: { clock },
  config: {
    globalStyles: Bun.file("./app.css"),
    scripts: () => "console.info('MiniFW started')",
  },
  error(caught) {
    if (isMiniError(caught)) {
      return new Response(caught.message, { status: caught.status });
    }

    return new Response("Internal Server Error", { status: 500 });
  },
});
```

`mini()` returns the running `Bun.Server`, so standard server methods and
properties remain available after startup.

## Routes And Partials

`routes` accepts MiniFW [page()](/docs/core/page) instances or native
[Bun.serve](https://bun.sh/docs/runtime/http/server) route entries. Native
entries bypass MiniFW layouts, rendering, caching, scoped styles, and request
context, which makes them appropriate for assets, webhooks, and health checks.

Register [partials](/docs/core/partial) by name under `partials`; MiniFW serves
each at `/partial/<name>`. Use [redirect()](/docs/core/redirect) for a fixed
native route redirect and [redirectTo()](/docs/helpers/redirect-to) when a
render must decide to redirect.

## Layouts

`layouts` maps route patterns to composable [layout()](/docs/core/layout)
shells. Every matching layout wraps the leaf page from least to most specific:

```ts
mini({
  layouts: {
    "*": appLayout,
    "/docs/*": docsLayout,
    "/admin/*": adminLayout,
  },
});
```

MiniFW always creates the final `<!DOCTYPE html>`, `<html>`, `<head>`, and
`<body>`. If no layouts match, the page is placed directly inside `<body>`.
Within an unchanged layout chain, boosted navigation swaps only the innermost
layout target. Moving between chains triggers an `HX-Redirect` full navigation.

## Document Configuration

`config` controls the generated document and browser-level behavior:

```ts
mini({
  config: {
    document: {
      htmlAttributes: { lang: "en", dir: "ltr" },
      bodyAttributes: { class: "app", "data-theme": "light" },
      head: () => '<link rel="icon" href="/favicon.svg">',
    },
    htmx: { type: "cdn", version: "4.0.0" },
    runtime: true,
    globalStyles: [Bun.file("./tokens.css"), Bun.file("./app.css")],
    scripts: () => "console.info('Application loaded')",
  },
});
```

`document.head` appends arbitrary application-level tags while `page({ head })`
provides route metadata such as title, description, canonical URL, and robots.
MiniFW includes HTMX 4 and its scoped-style runtime by default. Set
`config.htmx: false` to omit HTMX, or `config.runtime: false` only when the
application manages scoped styles from HTMX responses itself.

Global styles are bundled and minified; global scripts are built and minified.
They appear only in full-page documents because those assets persist across
boosted page navigation.

## Error Handling

`mini()` preserves Bun's `error` option. Errors thrown by a page or partial,
including [error()](/docs/helpers/error), propagate to Bun's handler. Use
[isMiniError()](/docs/helpers/is-mini-error) to distinguish expected MiniFW HTTP
errors from unexpected exceptions.

```ts
mini({
  error(caught) {
    if (isMiniError(caught)) {
      return new Response(caught.message, { status: caught.status });
    }

    return new Response("Internal Server Error", { status: 500 });
  },
});
```

For generated output details, see [Minification](/docs/extra/minification),
[Style Encapsulation](/docs/extra/style-encapsulation), and
[Runtime](/docs/extra/runtime).
