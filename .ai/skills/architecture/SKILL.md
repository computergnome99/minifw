---
name: architecture
description:
  "Use when: changing MiniFW public APIs, core/helpers boundaries, routes,
  page/partial/layout behavior, style encapsulation, or server/browser runtime
  boundaries."
user-invocable: true
---

# MiniFW Architecture

## Repository Layout

- `lib/core/`: public rendering primitives and server composition.
- `lib/helpers/`: public stateless utilities.
- `lib/internal/`: private implementation helpers; colocated specs cover unit
  behavior.
- `lib/runtime/`: browser code injected into generated documents. Keep it
  browser-compatible and small.
- `lib/**/__fixtures__/`: checked-in test assets for bundling/import integration
  tests.
- `*.spec.ts`: Bun test files, normally colocated with their source.

## Public Boundaries

- `lib/core/` is the `minifw/core` public API.
- `lib/helpers/` is the `minifw/helpers` public API.
- `lib/internal/` and `lib/runtime/` are private. Do not expose them through
  `package.json` exports, but ship them with `lib/` for internal source imports.
- Public exports are defined in `lib/core/index.ts` and `lib/helpers/index.ts`.

## Rendering Model

- `mini()` creates the Bun server and composes page and partial routes.
- `page()` renders full-page and HTMX responses; layouts wrap only non-HTMX page
  responses.
- `partial()` serves `/partial/<name>` routes and rejects non-HTMX requests by
  default unless `allowNonHtmx` is enabled.
- `layout()` constructs the document and adds global assets, scoped styles,
  HTMX, and the client runtime.
- `fragment()` is an unserved reusable render function without request context.

## Style and Runtime Rules

- Scoped page and partial styles use `fwsc` for element selectors and `fwid` for
  deterministic style-tag deduplication.
- Full-page layouts extract `style[fwid]` from body content and place it in
  `<head>`.
- `lib/runtime/` runs in browsers after HTMX swaps. Keep server-only APIs out of
  it.
- LinkeDOM runs on the Bun server. Use LinkeDOM-supported serialization APIs
  such as `innerHTML`; do not assume current browser-only DOM APIs exist.

## Procedure

1. Identify whether the change is public (`core`/`helpers`) or private
   (`internal`/`runtime`).
2. Preserve existing route, HTMX, cache, error-mapping, and scoped-style
   behavior unless the task explicitly changes it.
3. Update a colocated spec for behavioral changes.
4. Optionally run the focused spec while iterating.
5. Follow the conditional validation procedure in the code-quality skill.
