---
name: build-release
description: "Use when: changing MiniFW build output, TypeScript declarations, package exports or metadata, npm packaging, or preparing a release."
user-invocable: true
---

# Build and Release

## Distribution Contract

- Bun bundles the public entries `lib/core/index.ts` and `lib/helpers/index.ts` into `dist/core/index.js` and `dist/helpers/index.js`.
- `tsc --project tsconfig.build.json` emits declarations into the matching `dist/` tree.
- `package.json` exports `minifw/core` and `minifw/helpers` from those generated files. `lib/internal` and `lib/runtime` remain private implementation details.
- `dist/` is generated and must never be manually edited.

## TypeScript Configuration

- `tsconfig.json` is the editor/development typecheck project. It has `noEmit: true` and excludes `dist`.
- `tsconfig.build.json` extends it, includes production `lib/**/*.ts`, excludes specs and fixtures, and emits declarations only.
- Keep declaration paths aligned with the Bun output paths and `package.json` exports.

## Commands

- `bun run clean`: remove `dist/`.
- `bun run build`: clean, bundle public JavaScript, then emit declarations.
- `bun test`: behavior verification.
- `bun run lint:fix`: apply ESLint and Prettier fixes.
- `npm pack --dry-run`: inspect the package contents before publishing.

## Release Procedure

1. Update version and package metadata deliberately.
2. Run `bun run lint:fix`. If the release work also changes a `.ts` file, then run `bun test` and `bun run build` too.
3. Confirm each exported JavaScript and declaration pair exists in `dist/`.
4. Run `npm pack --dry-run`; verify only `dist`, `README.md`, `LICENSE`, and expected package metadata would ship.
5. Install the packed tarball in a clean Bun consumer project and import both `minifw/core` and `minifw/helpers` before publishing.
