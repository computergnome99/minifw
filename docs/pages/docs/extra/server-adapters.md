---
title: Server Adapters
order: 34
tags: [bun, express, server, integration, adapter]
---

# Server Adapters

[mini()](/docs/core/mini) is MiniFW's Bun-only convenience server. It starts
`Bun.serve()`, registers pages and partials, resolves layouts, builds documents,
and loads configured global assets.

The render primitives receive Bun's `Bun.BunRequest`, so use MiniFW with Bun
servers. A different runtime can still use [fragment()](/docs/core/fragment) for
context-free markup.

## Bun.serve()

Use `page.render(context)` inside a native Bun route. Bun provides matched route
parameters on `request.params`; its route request satisfies
[MiniContext](/reference/core/shared)'s `request` field directly.

```ts
import { page } from "@calvinbonner/minifw/core";
import { html, isHtmx } from "@calvinbonner/minifw/helpers";

const product = page(({ params }) => html`<h1>Product ${params["name"]}</h1>`);

Bun.serve({
  routes: {
    "/products/:name": async (request) => {
      const context = {
        request,
        url: new URL(request.url),
        route: "/products/:name",
        params: request.params ?? {},
        isHtmx: isHtmx(request),
      };
      const content = await product.render(context);

      return new Response(content, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  },
});
```

## Choosing An Approach

Use `mini()` for a Bun application that wants MiniFW to own the full document,
routing, layouts, global styles/scripts, caching, redirects, and error mapping.

## Native Routes

Use a native route entry when an existing Bun application already owns a route's
response handling. MiniFW passes native Bun entries directly to `Bun.serve()`.

The
[`Bun.serve()` example](https://github.com/computergnome99/minifw/tree/master/examples/bun-routes/server.ts)
is a runnable reference implementation.
