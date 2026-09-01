---
title: mini()
order: 10
tags: [server, routes, bun, htmx]
---

# `mini()`

`mini()` starts a Bun server with MiniFW's server-rendered page and HTMX
conventions. It accepts the normal
[Bun.serve](https://bun.sh/docs/runtime/http/server) options, then adds page
composition, named partial endpoints, global assets, and scoped-style handling.

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
    <main id="content">${page}</main>
  `,
);

const home = page(() => html`<h1>Welcome to MiniFW</h1>`, {
  head: { title: "Home" },
});

const clock = partial(() => html`<time>${new Date().toISOString()}</time>`, {
  allowNonHtmx: true,
});

const server = mini({
  port: 3000,
  layout: appLayout,
  routes: {
    "/": home,
    "/health": () => new Response("OK"),
    "/docs": redirect("/docs/getting-started", 301),
  },
  partials: { clock },
  globalStyles: Bun.file("./app.css"),
  scripts: () => "console.info('MiniFW started')",
  error(caught) {
    if (isMiniError(caught)) {
      return new Response(caught.message, { status: caught.status });
    }

    return new Response("Internal Server Error", { status: 500 });
  },
});
```

`mini()` returns the running `Bun.Server`, so you can use its standard methods
and properties after startup.

## Routes

`routes` may contain MiniFW [page()](/docs/core/page) instances or native
[Bun.serve](https://bun.sh/docs/runtime/http/server) route entries. Pages
receive layout handling and HTMX behavior; native entries are passed directly to
Bun.

```ts
const server = mini({
  routes: {
    "/": page(() => "<h1>Home</h1>"),
    "/health": () => new Response("OK"),
    "/docs": redirect("/docs/getting-started", 301),
  },
});
```

Use [redirect()](/docs/core/redirect) for a redirect configured directly in a
route map. Use [redirectTo()](/docs/helpers/redirect-to) inside page, partial,
or layout rendering when the redirect depends on render-time logic.

Native routes do not receive MiniFW layout wrapping, HTML minification, request
context, cache behavior, or scoped styles. Use them for health checks, assets,
webhooks, and other endpoints that should stay entirely under Bun's control.

## Layouts And Pages

Set `layout` to apply a shared document shell to MiniFW pages. If you omit it,
MiniFW uses a default layout equivalent to `<main>${page}</main>`.

On an initial request, a page response includes the full layout. The generated
body enables HX-Boost, so later same-origin navigations carry
`HX-Request: true`. For those requests, MiniFW skips the layout and returns only
the next page's markup, setting `HX-Retarget` to the layout's `pageTarget`
(`main` by default).

See [layout()](/docs/core/layout) for layout overloads, HTMX options, and a full
request/response lifecycle explanation.

## Partials

Register a [partial()](/docs/core/partial) under `partials` to serve it at
`/partial/<name>`:

```ts
const server = mini({
  partials: {
    notification: partial(() => "<p>Saved</p>"),
  },
});
```

Partials receive MiniFW request context and reject non-HTMX requests by default.
Their output is minified and can include scoped styles. See
[partial()](/docs/core/partial) for the `allowNonHtmx`, style, and cache
options.

## Global Assets

`globalStyles` and `scripts` add application-wide assets to full-page responses.
Each accepts one loader, one `Bun.file(...)`, or an array containing either.

```ts
const server = mini({
  globalStyles: [Bun.file("./tokens.css"), Bun.file("./app.css")],
  scripts: () => "console.info('Application loaded')",
});
```

Style files are bundled so CSS imports resolve, then minified. Script entries
are built and minified before MiniFW inserts them into the document head. These
assets are omitted from partial and boosted page responses because the initial
layout response has already loaded them.

## Error Handling

`mini()` does not replace Bun's `error` option. Errors thrown by a
[page()](/docs/core/page) or [partial()](/docs/core/partial) propagate to Bun's
handler, including errors raised with [error()](/docs/helpers/error).

Use [isMiniError()](/docs/helpers/is-mini-error) to distinguish MiniFW HTTP
errors from unexpected exceptions:

```ts
const server = mini({
  error(caught) {
    if (isMiniError(caught)) {
      return new Response(caught.message, { status: caught.status });
    }

    console.error(caught);
    return new Response("Internal Server Error", { status: 500 });
  },
});
```

Intentional [redirectTo()](/docs/helpers/redirect-to) calls return a redirect
response directly and do not enter Bun's error handler.

## Operational Notes

`mini()` is Bun-only and requires Bun `1.4` or later. It starts listening as
soon as it returns. Use Bun's `fetch` option for unmatched requests and custom
fallback responses; use native route entries when a path should bypass MiniFW.

For an application overview, return to [Getting Started](/docs/getting-started).
For generated output details, see [Minification](/docs/extra/minification) and
[Runtime](/docs/extra/runtime).
