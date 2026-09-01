---
title: redirectTo()
order: 25
tags: [redirect, rendering, control flow]
---

# `redirectTo()`

`redirectTo()` stops rendering by throwing MiniFW redirect control flow. The
MiniFW route handler catches that value and returns its redirect response. Use
it inside a [page()](/docs/core/page), [partial()](/docs/core/partial), or
[layout()](/docs/core/layout) when the destination depends on render-time logic.

## Render-Time Redirects

```ts
import { redirectTo } from "@calvinbonner/minifw/helpers";

if (!session) redirectTo("/login", 303);
```

The function never returns, so code after it runs only when the condition is
false. It defaults to `302`; pass another valid redirect status when needed.

```ts
const account = page(({ params }) => {
  if (!params["userId"]) redirectTo("/login", 303);

  return "<h1>Account</h1>";
});
```

Use [redirect()](/docs/core/redirect) when a route always redirects and can be
declared directly in `mini({ routes })`. Use `redirectTo()` when rendering must
first make a decision.

Intentional redirects do not enter Bun's `error` callback. Use
[error()](/docs/helpers/error) for a failure that should be handled there. See
[isMiniRedirect()](/docs/helpers/is-mini-redirect) when building a custom
rendering integration.
