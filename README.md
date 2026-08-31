```txt
         _ _     _   ___  _______
   /|  /| | |  /| | |  _|/      /
  / | / | | | / | | | |_|  /|  /
 /  |/  | | |/  | | |  _| / | /
/______/|_|____/|_| |_| |/  |/
```

# Mini Framework

MiniFW is a Bun-only, server-rendered framework for HTMX applications. It keeps
application state on the server and renders HTML responses, with a small client
runtime only for HTMX navigation and scoped styles.

## Installation

Install from npm:

```sh
bun add minifw
```

Or install from JSR:

```sh
deno add jsr:@calvinbonner/minifw
```

MiniFW requires Bun `1.4` or later to run the server.

## Quick Start

```ts
import { mini, page } from "minifw/core";

mini({
  port: 3000,
  routes: {
    "/": page(() => "<h1>Welcome to MiniFW</h1>"),
  },
});
```

`mini()` creates and returns a `Bun.Server`. Its options include Bun's standard
server options such as `port`, plus `routes`, `partials`, `layout`,
`globalStyles`, and `scripts`.

## Core API

Import MiniFW's server primitives from `minifw/core`.

### `mini()`

`mini(options)` starts the server and maps pages to route patterns. A page
request receives a full document; an HTMX request receives only the page
fragment and its head metadata.

```ts
import { mini, page } from "minifw/core";

mini({
  port: 3000,
  routes: {
    "/products/:id": page(({ params }) => `<h1>Product ${params["id"]}</h1>`),
  },
  globalStyles: Bun.file("./app.css"),
  scripts: () => "console.log('MiniFW started')",
});
```

`globalStyles` accepts a loader, `Bun.file(...)`, or an array of either. MiniFW
bundles imported CSS before injecting it into full-page responses. `scripts`
accepts the same forms for JavaScript or TypeScript source.

### `page()`

`page(render, options?)` creates a route handler. Use the optional style
function overload to attach CSS scoped to that page's markup, and use `head` and
`cache` options when needed.

```ts
import { page } from "minifw/core";

const profile = page(
  ({ params }) => `<article class="profile"><h1>${params.name}</h1></article>`,
  () => ".profile { max-width: 60ch; }",
  {
    head: { title: "Profile" },
    cache: { ttl: 60_000 },
  },
);
```

Page styles are scoped automatically and moved into `<head>` for full-page
responses. Cache options are `true` for an indefinite cache, `{ ttl }` for a
millisecond TTL, or `false`/omitted to disable caching.

### `partial()`

`partial(render, options?)` creates an HTMX fragment endpoint. Register it in
`mini({ partials })`; MiniFW serves it at `/partial/<name>`. Partials reject
non-HTMX requests by default, which you can relax with `allowNonHtmx`.

```ts
import { partial } from "minifw/core";

const counter = partial(
  ({ url }) => {
    const count = Number(url.searchParams.get("count") ?? "0") + 1;
    return `<section id="counter"><p>Count: ${count}</p><button hx-get="/partial/counter?count=${count}" hx-target="#counter" hx-swap="outerHTML">Increment</button></section>`;
  },
  { allowNonHtmx: true },
);
```

Like pages, partials support the style-function overload and cache options.

### `layout()`

`layout(body, options?)` wraps every full-page response in a document. It
creates the document shell, includes title and metadata from `page()` options,
loads HTMX, and enables boosted navigation.

```ts
import { layout } from "minifw/core";

const appLayout = layout(({ page }) => `<main class="app">${page}</main>`, {
  htmx: { type: "cdn", version: "4.0.0" },
  bodyArguments: { class: "app-body" },
});
```

Omit `htmx` to use MiniFW's pinned HTMX `4.0.0` default. The generated body uses
both HTMX 1/2 and HTMX 4 boost declarations, so descendant links remain boosted
across supported HTMX versions. Pass `disableRuntime: true` only when the
client-side scoped-style promotion runtime is not needed.

### `fragment()`

`fragment(render)` defines reusable markup without server context or routing.
Use a typed fragment where reusable markup takes properties.

```ts
import { fragment } from "minifw/core";

const badge = fragment<{ label: string }>(
  ({ label }) => `<span class="badge">${label}</span>`,
);

const markup = await badge({ label: "New" });
```

Wrap a fragment in `page()` or `partial()` when it needs to be served.

## Helpers

Import HTML/CSS template tags and rendering helpers from `minifw/helpers`.

```ts
import { css, each, html, repeat } from "minifw/helpers";

const rows = each(["Ada", "Lin"], (name) => html`<li>${name}</li>`);
const stars = repeat(3, () => "*");
const styles = css`
  .badge {
    color: teal;
  }
`;
```

`html` and `css` return raw template strings; escape untrusted values before
interpolating them. `error(status, message)` throws a renderable HTTP error, and
`isHtmx(request)` checks for the `HX-Request` header.

## HTMX Compatibility

MiniFW defaults to HTMX `4.0.0` and has browser testbeds for HTMX `1.9.12`,
`2.0.4`, and `4.0.0`. HTMX 4's boosted-navigation and lifecycle-event changes
are handled by MiniFW's generated document and client runtime.

## API Documentation

Build the generated API reference locally:

```sh
bun run docs:build
```

Open `docs/index.html` after the command completes.
