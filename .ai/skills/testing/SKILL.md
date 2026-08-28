---
name: testing
description: "Use when: writing, updating, debugging, or reviewing Bun tests, colocated .spec.ts files, HTTP integration tests, or __fixtures__ assets in MiniFW."
user-invocable: true
---

# Testing MiniFW

## Test Layout

- Tests are Bun specs colocated with the source: `thing.ts` and `thing.spec.ts`.
- `lib/core/*.spec.ts` cover public primitive integration behavior.
- `lib/internal/**/*.spec.ts` cover focused helper behavior.
- `lib/core/__fixtures__/` contains real CSS and TypeScript dependency graphs used to verify `Bun.file(...)` bundling and import resolution.

## What to Test

- Test observable output and public contracts, not internal implementation details.
- Exercise both full-page and HTMX behavior when changing pages, partials, layouts, scripts, styles, caching, or error mapping.
- For styles, cover scoping, deduplication, extraction into `<head>`, and failure behavior when applicable.
- For loaders using `Bun.file(...)`, preserve fixture-based tests: they verify real import bundling that string-only tests cannot prove.

## Procedure

1. Add or update the nearest colocated `*.spec.ts` file.
2. Run the focused test: `bun test path/to/file.spec.ts`.
3. Keep assertions resilient to valid Bun output changes; assert the behavior under test rather than incidental bundle variable names.
4. A spec is a TypeScript file, so finish by running `bun run lint:fix`, `bun test`, and `bun run build`. All three must pass before completion.
