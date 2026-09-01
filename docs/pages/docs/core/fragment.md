---
title: fragment()
order: 14
tags: [fragment, reusable, markup, component]
---

# `fragment()`

`fragment()` creates reusable, context-free markup. Unlike
[page()](/docs/core/page) and [partial()](/docs/core/partial), a fragment is not
a route, receives no request data, and has no built-in style or cache options.

## Fragments With Properties

```ts
import { fragment } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const badge = fragment<{ text: string }>(
  ({ text }) => html`<span class="badge">${text}</span>`,
);

const markup = badge({ text: "New" });
```

When a fragment needs no input, declare it without a generic and call it without
arguments:

```ts
const footer = fragment(() => html`<footer>Copyright 2026</footer>`);

const markup = footer();
```

Fragments can return a string or a promise of a string. They are ideal for
sharing presentation markup without creating an HTTP endpoint.

## Composition

Call a fragment from a page, partial, or layout:

```ts
const card = fragment<{ title: string; content: string }>(
  ({ content, title }) => html`
    <article class="card">
      <h2>${title}</h2>
      <p>${content}</p>
    </article>
  `,
);

const home = page(() => card({ title: "Welcome", content: "Hello." }));
```

Use [each()](/docs/helpers/each) or [repeat()](/docs/helpers/repeat) to compose
multiple fragments from data.

Fragments deliberately do not escape interpolated values. Use trusted content,
or escape/sanitize untrusted values before inserting them into an
[html](/docs/helpers/html) template.

## Choosing A Primitive

Use a fragment for shared markup with no request context. Use a
[page()](/docs/core/page) for a routable document view, a
[partial()](/docs/core/partial) for an HTMX endpoint, and a
[layout()](/docs/core/layout) for the shared application shell.
