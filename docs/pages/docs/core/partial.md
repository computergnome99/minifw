---
title: partial()
order: 13
tags: [partial, htmx, endpoint, fragment]
---

# `partial()`

`partial()` creates a request-aware HTML fragment endpoint for HTMX
interactions. Register partials with [mini()](/docs/core/mini); MiniFW serves a
partial named `name` at `/partial/name`.

## Basic Partial

```ts
import { partial } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const counter = partial(({ url }) => {
  const count = Number(url.searchParams.get("count") ?? "0") + 1;

  return html`<section id="counter">
    <p>Count: ${count}</p>
    <button
      hx-get="/partial/counter?count=${count}"
      hx-target="#counter"
      hx-swap="outerHTML"
    >
      Increment
    </button>
  </section>`;
});

mini({ partials: { counter } });
```

The render function receives the same request context as a
[page()](/docs/core/page): `request`, `url`, `route`, `params`, and `isHtmx`.
Use query values from `url.searchParams` and route parameters from `params`.

## HTMX Request Guard

Partials require `HX-Request: true` by default. A regular request receives a
`400` MiniFW error, which your Bun `error` handler can identify with
[isMiniError()](/docs/helpers/is-mini-error).

Set `allowNonHtmx: true` when an endpoint should also support ordinary browser
or server-to-server requests:

```ts
const status = partial(() => "<p>Ready</p>", { allowNonHtmx: true });
```

`allowNonHtmx` is useful for endpoints that progressively enhance a standard
link or form. Keep the default for HTMX-only UI updates to avoid exposing an
endpoint unintentionally.

## Scoped Styles

The style-function overload works the same way as it does for
[pages](/docs/core/page):

```ts
const notice = partial(
  () => '<p class="notice">Saved</p>',
  () => ".notice { color: green; }",
);
```

MiniFW scopes the CSS to this partial's rendered elements. When HTMX swaps the
response into the document, MiniFW's [runtime](/docs/extra/runtime) promotes new
scoped styles into the head. See
[Style Encapsulation](/docs/extra/style-encapsulation).

## Caching

Partials accept `cache: true` for an indefinite cache or `cache: { ttl }` for a
millisecond time-to-live:

```ts
const productCount = partial(renderCount, { cache: { ttl: 5_000 } });
```

Cache keys include the partial name, URL path and query string, route
parameters, and HTMX state. See [Cache Management](/docs/extra/cache-management)
before caching personalized or mutable responses.

## Redirects And Errors

Use [redirectTo()](/docs/helpers/redirect-to) for redirects determined while a
partial renders, and [error()](/docs/helpers/error) for expected HTTP failures.
Unexpected errors propagate to Bun's `error` handler.

Use [fragment()](/docs/core/fragment) for reusable markup that does not need a
request endpoint.
