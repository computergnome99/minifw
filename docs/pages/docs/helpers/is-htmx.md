---
title: isHtmx()
order: 24
tags: [htmx, request, headers]
---

# `isHtmx()`

`isHtmx()` checks whether a request includes `HX-Request: true`. It returns a
boolean and does not inspect any other HTMX headers.

## Native Bun Handlers

```ts
import { isHtmx } from "@calvinbonner/minifw/helpers";

if (isHtmx(request)) {
  return new Response("Partial update");
}
```

Page and partial render functions already receive the same information as
`context.isHtmx`; this helper is most useful in native Bun route handlers mixed
into [mini()](/docs/core/mini):

```ts
mini({
  routes: {
    "/status": (request) =>
      new Response(isHtmx(request) ? "Updated" : "Status page"),
  },
});
```

For MiniFW [pages](/docs/core/page), `isHtmx` affects whether
[layout()](/docs/core/layout) is applied. For [partials](/docs/core/partial),
the header is required by default unless `allowNonHtmx` is enabled.
