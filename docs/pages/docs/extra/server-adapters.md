---
title: Server Adapters
order: 34
tags: [bun, express, server, integration, adapter]
---

# Server Adapters

[mini()](/docs/core/mini) is MiniFW's Bun-only convenience server. It starts
`Bun.serve()`, registers pages and partials, resolves layouts, builds documents,
and loads configured global assets.

You can instead use [page()](/docs/core/page), [partial()](/docs/core/partial),
[layout()](/docs/core/layout), and [fragment()](/docs/core/fragment) with
another server. In that arrangement, the host server owns routing, request
conversion, response headers, document composition, and error handling.

## Bun.serve()

Use `page.render(context)` inside a native Bun route. Bun provides matched route
parameters on `request.params`; build a [MiniContext](/reference/core/shared)
from the request before rendering.

```ts
import { page } from "@calvinbonner/minifw/core";
import { html, isHtmx } from "@calvinbonner/minifw/helpers";

const product = page(({ params }) => html`<h1>Product ${params["name"]}</h1>`);

type RoutedRequest = Request & { params?: Record<string, string> };

Bun.serve({
  routes: {
    "/products/:name": async (request: RoutedRequest) => {
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

## Express

Express can render the same page after converting its request into the standard
web `Request` object. Pass Express route parameters into the context and send
the rendered HTML through Express's response object.

```ts
import express from "express";
import { page } from "@calvinbonner/minifw/core";
import { html, isHtmx } from "@calvinbonner/minifw/helpers";

const product = page(({ params }) => html`<h1>Product ${params["name"]}</h1>`);

const app = express();

app.get("/products/:name", async (request_, response, next) => {
  try {
    const request = new Request(
      `http://${request_.headers.host ?? "127.0.0.1:3000"}${request_.originalUrl}`,
      { headers: { "HX-Request": request_.get("HX-Request") ?? "" } },
    );
    const context = {
      request,
      url: new URL(request.url),
      route: "/products/:name",
      params: request_.params,
      isHtmx: isHtmx(request),
    };

    response.type("html").send(await product.render(context));
  } catch (error) {
    next(error);
  }
});

app.listen(3000);
```

## Choosing An Approach

Use `mini()` for a Bun application that wants MiniFW to own the full document,
routing, layouts, global styles/scripts, caching, redirects, and error mapping.
Use a server adapter when an existing application already owns those concerns or
when it runs on a server other than Bun.

## Future Compatibility

MiniFW is planned to become more open across server runtimes. The goal is for
its core components to become server-agnostic and run on Bun, Node.js, and Deno,
with runtime-specific server adapters layered on top. Today, `mini()` remains
Bun-only; use an adapter when integrating with another server.

The
[`Bun.serve()` example](https://github.com/computergnome99/minifw/tree/master/examples/bun-routes/server.ts)
and
[Express example](https://github.com/computergnome99/minifw/tree/master/examples/express/server.ts)
are runnable reference implementations.
