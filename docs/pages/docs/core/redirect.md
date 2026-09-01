---
title: redirect()
order: 15
tags: [redirect, response, route, bun]
---

# `redirect()`

`redirect()` creates a standard redirect `Response` for direct use in a native
Bun route entry. It defaults to status `302` and accepts any URL accepted by
`Response.redirect()`.

## Static Route Redirects

```ts
import { mini, redirect } from "@calvinbonner/minifw/core";

mini({
  routes: {
    "/docs": redirect("/docs/getting-started", 301),
  },
});
```

This is useful when a route always has the same destination. Because it is a
native Bun route entry, no [page()](/docs/core/page) or
[layout()](/docs/core/layout) rendering occurs.

## Status Codes

Pass a redirect status as the second argument when the default temporary `302`
is not appropriate:

```ts
const permanentDocs = redirect("/docs/getting-started", 301);
const signedIn = redirect("/account", 303);
```

Choose the status according to the request and caching semantics your
application needs. `redirect()` delegates status validation to the platform's
`Response.redirect()` implementation.

## Render-Time Redirects

For a redirect decided during a page, partial, or layout render, use
[redirectTo()](/docs/helpers/redirect-to) instead. It stops the current render
before MiniFW returns a redirect response:

```ts
const account = page(({ params }) => {
  if (!params["userId"]) redirectTo("/login", 303);

  return "<h1>Account</h1>";
});
```

See [mini()](/docs/core/mini) for mixing MiniFW pages, redirects, and native Bun
routes in one server.
