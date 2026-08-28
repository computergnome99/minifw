# MiniFW Agent Guide

## Project Overview

MiniFW is a Bun-only TypeScript library for server-rendered HTMX applications.
Its public API is split into two package subpaths:

- `minifw/core`: `mini`, `page`, `partial`, `layout`, `fragment`, and shared
  public types.
- `minifw/helpers`: HTML/CSS template tags and small rendering helpers.

Source lives under `lib/`. Keep public API in `lib/core/` or `lib/helpers/`;
`lib/internal/` and `lib/runtime/` are implementation details and must not be
exported as package subpaths.

## Skills

| Skill                       | When to Use                                                                                            | Path                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Public API and architecture | Changing `core`, `helpers`, package exports, routing, pages, partials, layouts, or runtime boundaries. | [.ai/skills/architecture/SKILL.md](.ai/skills/architecture/SKILL.md)   |
| JSDoc and public docs       | Adding or revising exported APIs, overloads, types, examples, or API documentation.                    | [.ai/skills/jsdoc/SKILL.md](.ai/skills/jsdoc/SKILL.md)                 |
| Testing                     | Adding, changing, debugging, or reviewing Bun specs, Bun WebView e2e suites, and fixtures.             | [.ai/skills/testing/SKILL.md](.ai/skills/testing/SKILL.md)             |
| Linting and formatting      | Resolving ESLint, Unicorn, JSDoc, or Prettier findings, or changing code-quality configuration.        | [.ai/skills/code-quality/SKILL.md](.ai/skills/code-quality/SKILL.md)   |
| Build and release           | Changing build output, declarations, package metadata, exports, or preparing an npm release.           | [.ai/skills/build-release/SKILL.md](.ai/skills/build-release/SKILL.md) |
