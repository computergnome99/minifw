---
title: error()
order: 22
tags: [error, status, bun, handling]
---

# `error()`

`error()` stops a page or partial render by throwing a MiniFW HTTP error. Its
status must be a safe integer in the `400` through `599` range.

## Expected HTTP Failures

```ts
import { error } from "@calvinbonner/minifw/helpers";

if (!user) error(404, "User not found");
```

Use it after a request-dependent check in a [page()](/docs/core/page) or
[partial()](/docs/core/partial). The `never` return type tells TypeScript that
execution does not continue after the call.

## Bun Error Handling

MiniFW lets the error reach Bun's `error` server option. Use
[isMiniError()](/docs/helpers/is-mini-error) to narrow the caught value and
return its intended status and message:

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

`isMiniError()` returns `false` for ordinary exceptions, which remain available
to the same Bun error handler. Use [redirectTo()](/docs/helpers/redirect-to),
not `error()`, when the response should redirect rather than fail. See
[isMiniError()](/docs/helpers/is-mini-error) for the guard's full reference.
