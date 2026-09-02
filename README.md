[![JSR](https://img.shields.io/badge/jsr-f7df43?style=for-the-badge&logo=jsr&logoColor=093343)](https://jsr.io/@calvinbonner/minifw)
[![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://npmjs.org/@calvinbonner/minifw)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/computergnome99/minifw)

<p align="center">
  <img src="https://minifw.calvinbonner.dev/assets/logo.svg" alt="MiniFW" height="160" />
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

## Minimal Application

```ts
import { layout, mini, page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

mini({
  port: 3000,
  layouts: {
    "*": layout(({ page }) => html`<main id="app">${page}</main>`, {
      pageTarget: "#app",
    }),
  },
  routes: {
    "/": page(
      () => html`
        <h1>Welcome to MiniFW</h1>
        <p>This page is rendered on the server.</p>
      `,
    ),
    "/about": page(() => html`<h1>About</h1>`),
  },
});
```

Run the application with `bun .`, then open `http://localhost:3000`. MiniFW
creates the document, serves each page, and uses HTMX to swap the `#app` target
on boosted navigation.

## Documentation

Read the full guides and API reference at
[minifw.calvinbonner.dev](https://minifw.calvinbonner.dev).
