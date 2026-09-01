---
title: isMiniError()
order: 24
tags: [error, type guard, bun, handling]
---

# `isMiniError()`

`isMiniError()` is a type guard for errors created by
[error()](/docs/helpers/error). It accepts any value and returns `true` only for
a `MiniHttpError`.

## Bun Error Handlers

Use the guard in Bun's `error` callback to distinguish an expected MiniFW HTTP
failure from an unexpected exception. After it returns `true`, TypeScript knows
the value has `status` and `message` properties:

```ts
import { mini } from "@calvinbonner/minifw/core";
import { isMiniError } from "@calvinbonner/minifw/helpers";

mini({
  error(caught) {
    if (isMiniError(caught)) {
      return new Response(caught.message, { status: caught.status });
    }

    console.error(caught);
    return new Response("Internal Server Error", { status: 500 });
  },
});
```

## What It Recognizes

The guard returns `false` for ordinary `Error` instances, strings, and any other
value. MiniFW does not intercept those errors; they reach the same Bun handler.
`isMiniError()` does not validate arbitrary objects with matching properties,
because it specifically identifies MiniFW's `MiniHttpError` class.

Use [error()](/docs/helpers/error) to create an expected `4xx` or `5xx` error
inside a [page()](/docs/core/page) or [partial()](/docs/core/partial). Use
[isMiniRedirect()](/docs/helpers/is-mini-redirect) only for custom handling of
render-time redirects.
