---
name: jsdoc
description:
  "Use when: adding or changing exported MiniFW functions, classes, interfaces,
  types, overloads, examples, or API documentation."
user-invocable: true
---

# JSDoc for MiniFW

## Required Scope

JSDoc is required for exported functions and classes. Public interfaces and
types should also have concise descriptions when they define consumer-facing
concepts. Internal implementation details do not need exhaustive API
documentation.

## Style

- Use `{@link SymbolName}` to connect related public API concepts.
- Describe observable behavior, constraints, and return values.
- Include `@example` blocks for public factories with non-obvious usage.
- Use `@param` and `@returns` where they improve public API documentation;
  internal helpers can use brief orientation comments instead.
- Let `prettier-plugin-jsdoc` control JSDoc layout. Do not manually fight line
  wrapping or tag spacing.

## Procedure

1. Read the nearest public API's existing JSDoc and follow its vocabulary.
2. Document only the public contract, not obvious implementation mechanics.
3. Ensure documented option names match the actual types and overloads.
4. Run `bun run lint:fix` to apply ESLint and Prettier's deterministic
   formatting.
5. Because JSDoc changes do not modify TypeScript source, no test or build run
   is required unless the task also changes a `.ts` file.
