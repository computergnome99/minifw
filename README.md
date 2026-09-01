[![JSR](https://img.shields.io/badge/jsr-f7df43?style=for-the-badge&logo=jsr&logoColor=093343)](https://jsr.io/@calvinbonner/minifw)
[![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://npmjs.org/@calvinbonner/minifw)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/computergnome99/minifw)

<p align="center">
  <img src="http://localhost:3000/assets/logo.svg" alt="MiniFW" height="160" />
</p>

# Mini Framework

MiniFW is a server-rendered framework for HTMX applications. It keeps
application state on the server and renders HTML responses, with a small client
runtime only for HTMX navigation and scoped styles.

## Installation

<details>
  <summary>Using <b>JSR</b> Repositories</summary>

```bash
# deno
deno add jsr:@calvinbonner/minifw

# npm
npx jsr add @calvinbonner/minifw

# pnpm
pnpm dlx jsr add @calvinbonner/minifw

# bun
bunx jsr add @calvinbonner/minifw

# yarn
yarn dlx jsr add @calvinbonner/minifw
```

Or, when using Deno, you can import directly from JSR without installing:

```ts
import { mini, page } from "jsr:@calvinbonner/minifw/core";
```

</details>

<details>
  <summary>Using <b>NPM</b> Repositories</summary>

```bash
# npm
npm install @calvinbonner/minifw

# pnpm
pnpm add @calvinbonner/minifw

# bun
bun add @calvinbonner/minifw

# yarn
yarn add @calvinbonner/minifw
```

</details>

> [!NOTE]
>
> MiniFW requires Bun `1.4` or later to run the `mini()` server.

## Quick Start

```ts
import { mini, page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

mini({
  port: 3000,
  routes: {
    "/": page(() => html`<h1>Welcome to MiniFW</h1>`),
  },
});
```

`mini()` creates and returns a `Bun.Server`. Its options include Bun's standard
server options such as `port`, plus `routes`, `partials`, `layout`,
`globalStyles`, and `scripts`.

> [!NOTE]
>
> You do not need to use `mini()` or a Bun server. The core primitives work
> independently and can be integrated with any JavaScript server, including
> `Bun.serve()` and Express. `mini()` is a Bun-focused convenience wrapper that
> wires routes, partials, layouts, global assets, and error handling together
> for you. See the Bun routes and Express examples for custom server adapters.

## Core API

Import MiniFW's server primitives from `@calvinbonner/minifw/core`.

### `mini()`

`mini(options)` starts the server and maps pages to route patterns. A page
request receives a full document; an HTMX request receives only the page
fragment and its head metadata.

```ts
import { mini, page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

mini({
  port: 3000,
  routes: {
    "/products/:id": page(
      ({ params }) => html`<h1>Product ${params["id"]}</h1>`,
    ),
  },
  globalStyles: Bun.file("./app.css"),
  scripts: () => "console.log('MiniFW started')",
});
```

`globalStyles` accepts a loader, `Bun.file(...)`, or an array of either. MiniFW
bundles imported CSS before injecting it into full-page responses. `scripts`
accepts the same forms for JavaScript or TypeScript source.

Routes can also use native `Bun.serve()` route entries directly. Use
`redirect()` for a static redirect response:

```ts
import { mini, page, redirect } from "@calvinbonner/minifw/core";

mini({
  routes: {
    "/": page(() => "<h1>Home</h1>"),
    "/health": () => new Response("OK"),
    "/docs": redirect("/docs/getting-started", 301),
  },
});
```

Use `redirectTo()` inside a page, partial, or layout render function to stop
rendering and redirect the client:

```ts
import { page } from "@calvinbonner/minifw/core";
import { redirectTo } from "@calvinbonner/minifw/helpers";

const account = page(({ params }) => {
  if (!params["userId"]) redirectTo("/login");

  return "<h1>Account</h1>";
});
```

### `page()`

`page(render, options?)` creates a route handler. Use the optional style
function overload to attach CSS scoped to that page's markup, and use `head` and
`cache` options when needed.

```ts
import { page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const profile = page(
  ({ params }) =>
    html`<article class="profile"><h1>${params["name"]}</h1></article>`,
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
import { partial } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const counter = partial(
  ({ url }) => {
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
import { layout } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const appLayout = layout(({ page }) => html`<main class="app">${page}</main>`, {
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
import { fragment } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const badge = fragment<{ label: string }>(
  ({ label }) => html`<span class="badge">${label}</span>`,
);

const markup = await badge({ label: "New" });
```

Wrap a fragment in `page()` or `partial()` when it needs to be served.

## Helpers

Import HTML/CSS template tags and rendering helpers from
`@calvinbonner/minifw/helpers`.

```ts
import { css, each, html, repeat } from "@calvinbonner/minifw/helpers";

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
