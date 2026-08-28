---
name: build-release
description:
  "Use when: changing MiniFW build output, TypeScript declarations, package
  exports or metadata, npm packaging, or preparing a release."
user-invocable: true
---

# Build and Release

## Distribution Contract

- MiniFW ships its `lib/` TypeScript source directly; it does not produce a
  `dist/` build.
- `package.json` exports `minifw/core` from `lib/core/index.ts` and
  `minifw/helpers` from `lib/helpers/index.ts`.
- `lib/internal` and `lib/runtime` remain private implementation details, but
  ship under `lib/` so public source entries can import them.
- Bun consumers transpile the source package at runtime. Keep imports
  Bun-compatible and preserve extensionless local imports.

## TypeScript Configuration

- `tsconfig.json` is the editor/development typecheck project and has
  `noEmit: true`.
- Run `bun run test:types` to validate the source package before release.

## Commands

- `bun run test:unit`: run colocated Bun unit tests.
- `bun run test:e2e`: run example applications with Bun WebView.
- `bun run test:all`: run unit, type, and e2e validation.
- `bun run test:types`: type-check source without emitting artifacts.
- `bun run lint:fix`: apply ESLint and Prettier fixes.
- `npm pack --dry-run`: inspect the package contents before publishing.

## Release Procedure

1. Update version and package metadata deliberately.
2. Run `bun run lint:fix` and `bun run test:all`. Linux and Windows release
   hosts need Chrome, Chromium, Edge, or Brave for the WebView suites.
3. Run `npm pack --dry-run`; verify `lib`, `README.md`, `LICENSE`, and expected
   package metadata would ship.
4. Install the packed tarball in a clean Bun consumer project and import both
   `minifw/core` and `minifw/helpers` before publishing.
