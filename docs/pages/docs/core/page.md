---
title: page()
order: 11
tags: [page, route, rendering, htmx]
---

# `page()`

`page()` defines a server-rendered route for [mini()](/docs/core/mini). A page
render function returns HTML and receives request context: the original request,
parsed URL, matched route parameters, current route pattern, and HTMX state.

## Basic Page

```ts
import { page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const product = page(({ params }) => html`<h1>${params["id"]}</h1>`, {
  head: { title: "Product" },
});
```

Register it under a route pattern:

```ts
mini({
  routes: {
    "/products/:id": product,
  },
});
```

The route pattern becomes `context.route`, and Bun's matched `:id` parameter is
available as `context.params["id"]`.

## Render Context

| Field     | Description                                                |
| :-------- | :--------------------------------------------------------- |
| `request` | Original incoming `Request`                                |
| `url`     | Parsed request `URL`, including search parameters          |
| `route`   | Matched route pattern, when the page is served by `mini()` |
| `params`  | Route parameters as a string record                        |
| `isHtmx`  | Whether the request includes `HX-Request: true`            |

Use `url.searchParams` for query values and `params` for values captured by a
route pattern. For native Bun handlers outside a page, use
[isHtmx()](/docs/helpers/is-htmx) to detect the same header.

## Head Metadata

The optional `head` field provides document metadata for the initial response
and applicable `<title>`/`<meta>` updates for HTMX responses.

```ts
const profile = page(renderProfile, {
  head: {
    title: "Profile",
    description: "Manage your account profile.",
    canonical: "https://example.com/profile",
    robots: "noindex",
  },
});
```

[mini()](/docs/core/mini) creates the initial document and renders this metadata
in its head. Do not include `<html>`, `<head>`, or `<body>` in page markup.

## Scoped Styles

Use the style-function overload to attach CSS to a page. MiniFW scopes element
selectors to that page's markup, preventing collisions with other pages and
[partials](/docs/core/partial).

```ts
import { css, html } from "@calvinbonner/minifw/helpers";

const profile = page(
  ({ params }) => html`<article class="profile">${params["id"]}</article>`,
  () => css`
    .profile {
      max-width: 60ch;
    }
  `,
  { head: { title: "Profile" } },
);
```

For an initial response, scoped styles move into the document head. For a later
HTMX response, the markup includes its styles and MiniFW's
[runtime](/docs/extra/runtime) promotes any new style block into the existing
head. See [Style Encapsulation](/docs/extra/style-encapsulation) for details.

> [!WARNING] Scoped styles must be static
>
> When sending styles with page(), scoped styles must be static. Do not use
> request-specific or changing values in CSS returned by a page or partial style
> function. Within an already-loaded document, MiniFW promotes the first scoped
> style it receives for a route into `<head>` and deduplicates later styles
> using that route's stable identifier. A later HTMX response with changed CSS
> for the same page or partial will not replace the earlier client-side style.
>
> Use static scoped CSS and express changing presentation through markup,
> classes, attributes, or inline styles. A full-page navigation creates a new
> document and therefore receives its styles again.

## Caching

Set `cache: true` to cache a page indefinitely, or use a millisecond `ttl`.

```ts
const catalog = page(renderCatalog, { cache: { ttl: 60_000 } });
```

Page cache keys include the route, pathname, search string, parameters, and HTMX
state. Omit `cache`, or set it to `false`, when each request must render fresh
content. See [Cache Management](/docs/extra/cache-management).

## Normal And HTMX Responses

For a normal request, `mini()` renders the page inside all matching
[layouts](/docs/core/layout), returning a full document. For a standard HTMX
request, MiniFW returns page markup and targets the innermost layout's
`pageTarget`. For boosted navigation that shares an outer layout prefix, it
swaps only the changed inner fragment; unrelated layout chains use `HX-Redirect`
for a full navigation.

## Redirects And Errors

Call [redirectTo()](/docs/helpers/redirect-to) when render-time logic should
stop and redirect the client:

```ts
const account = page(({ params }) => {
  if (!params["userId"]) redirectTo("/login", 303);

  return "<h1>Account</h1>";
});
```

Call [error()](/docs/helpers/error) for an expected HTTP failure such as a
`404`. It reaches Bun's `error` handler, where
[isMiniError()](/docs/helpers/is-mini-error) narrows the error and exposes its
status.

Use [fragment()](/docs/core/fragment) to compose reusable context-free markup
inside a page. Use a [partial()](/docs/core/partial) when that markup needs its
own request endpoint.
