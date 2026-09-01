---
title: Getting Started
order: 0
tags: [intro, getting started, start, quick start, install, new, begin]
---

# Getting Started with MiniFW

Mini Framework (MiniFW) is a Bun-only library for server-rendered HTMX
applications. It keeps application code close to standard HTML, CSS, and
JavaScript while adding small, composable rendering primitives for pages,
partials, layouts, and fragments. There is no application build step: Bun runs
the TypeScript you write on the server.

## Installation

Install MiniFW through JSR or npm:

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

> [!WARNING] Important
>
> MiniFW requires Bun `1.4` or later to run the `mini()` server.

## Quick Start

Create a server file such as `app.ts`:

```ts
import { mini, page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const server = mini({
  port: 3000,
  routes: {
    "/": page(() => html`<h1>Welcome to MiniFW</h1>`),
  },
});

console.log(`Mini is running at ${server.url}`);
```

Start it with Bun:

```bash
bun app.ts
```

Then, just open `http://localhost:3000` to see your rendered application!

> [!NOTE] Fun fact
>
> Because `mini` wraps `Bun.serve`, its standard server options still work. To
> learn more about MiniFW's additions,
> [read more about mini()](/docs/core/mini), or learn more about
> [what Bun.serve can do](https://bun.sh/docs/runtime/http/server).
