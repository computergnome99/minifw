# Changelog

All notable changes to MiniFW will be documented in this file.

## Unreleased

### Changed

- `mini()` now owns document, HTMX, runtime, global asset, and document
  attribute configuration through `config`.
- Replaced app-level `layout` with composable route-pattern `layouts`.
  `layout()` now defines a nested body shell and its boosted page target.
- Compatible boosted navigation swaps the innermost matched layout target;
  navigating between different layout chains uses `HX-Redirect` for a full load.

## [0.1.0]

### Added

- Initial MiniFW release for Bun-powered, server-rendered HTMX applications.
- Core factories: `mini`, `page`, `partial`, `layout`, and `fragment`.
- Helpers: `html`, `css`, `each`, `repeat`, `isHtmx`, `error`, `isMiniError`,
  and `MiniHttpError`.
