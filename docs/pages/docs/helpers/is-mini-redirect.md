---
title: isMiniRedirect()
order: 26
tags: [redirect, type guard, rendering, control flow]
---

# `isMiniRedirect()`

`isMiniRedirect()` is a type guard for the control-flow value thrown by
[redirectTo()](/docs/helpers/redirect-to). It accepts any value and returns
`true` only for a `MiniRedirect`.

## Custom Rendering Integrations

[mini()](/docs/core/mini) catches MiniFW redirects automatically, so most
applications do not need this helper. Use it only when you invoke rendering
yourself and need to convert the thrown value into a response:

```ts
import { isMiniRedirect } from "@calvinbonner/minifw/helpers";

try {
  const markup = await renderAccount();
  return new Response(markup, { headers: { "content-type": "text/html" } });
} catch (caught) {
  if (isMiniRedirect(caught)) return caught.response;

  throw caught;
}
```

After the guard returns `true`, TypeScript knows the value has its redirect
`response`, including its destination and HTTP status.

## What It Recognizes

The guard returns `false` for ordinary exceptions and for arbitrary values. It
specifically identifies MiniFW's `MiniRedirect` class rather than validating
objects that merely have a `response` property.

Use [redirectTo()](/docs/helpers/redirect-to) for a redirect chosen during a
[page()](/docs/core/page), [partial()](/docs/core/partial), or
[layout()](/docs/core/layout) render. For a route that always redirects, use
[redirect()](/docs/core/redirect) instead.
