---
name: code-quality
description: "Use when: resolving or configuring ESLint, TypeScript ESLint, Unicorn, JSDoc linting, Prettier, formatting warnings, or code-quality scripts in MiniFW."
user-invocable: true
---

# Code Quality

## Tooling Ownership

- ESLint parses TypeScript with `typescript-eslint` and reports Prettier differences as warnings.
- Prettier, including `prettier-plugin-jsdoc`, owns source and JSDoc formatting.
- TypeScript owns unused-local and unused-parameter validation because it correctly understands this repository's type and documentation patterns.
- Unicorn protects general JavaScript quality, but browser-only rules must not override Bun or LinkeDOM compatibility.

## Intentional Exceptions

- `unicorn/prefer-dom-node-html-methods` is disabled because LinkeDOM does not implement `getHTML()`; use `innerHTML` for LinkeDOM serialization.
- `unicorn/single-line-block-comment-style` is disabled because it conflicts with Prettier's JSDoc layout.
- Fixture-only exceptions permit the conventional `__fixtures__` directory and an intentional `globalThis` assignment used to verify bundled script output.
- Required JSDoc is limited to exported declarations. Internal comments are optional and concise.

## Commands

- `bun run lint:fix`: apply ESLint and Prettier fixes to `lib`, `eslint.config.ts`, and `prettier.config.ts`.
- `bun test`: run the complete Bun test suite.
- `bun run build`: bundle public JavaScript and emit declarations.

## Required Validation

- After any `.ts` file change, run `bun run lint:fix`, `bun test`, and `bun run build`, in that order. All three must pass before completion.
- After a non-TypeScript-only change, such as Markdown, run only `bun run lint:fix`.
- Do not run check-only lint or Prettier commands before applying deterministic fixes. Use `bun run lint:fix`.

## Procedure

1. Identify the exact rule and determine whether it catches a real bug, a runtime-compatibility conflict, or an intentional fixture behavior.
2. Prefer a compatible code fix when a rule catches a real bug.
3. If a rule conflicts with an intentional runtime dependency or test fixture, add the narrowest config override and document why.
4. Follow the required validation procedure above.
