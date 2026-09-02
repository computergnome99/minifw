# Changelog

All notable changes to MiniFW will be documented in this file.

## [0.2.0]

### Added

- Native Bun route entries alongside MiniFW pages in `mini({ routes })`.
- `redirect()` for static route redirects and `redirectTo()` for redirects
  raised while rendering a page, partial, or layout.
- `isMiniError()` to identify expected MiniFW HTTP errors in Bun error handlers.
- Configurable document attributes, head content, HTMX loading, runtime, global
  styles, and global scripts through `mini({ config })`.
- Filesystem-backed Markdown documentation and a generated Typedoc API
  reference.

### Changed

- `mini()` now owns document, HTMX, runtime, global asset, and document
  attribute configuration through `config`.
- Replaced app-level `layout` with composable route-pattern `layouts`.
  `layout()` now defines a nested body shell and its boosted page target.
- Boosted navigation preserves shared outer layouts and swaps the changed inner
  target when possible; unrelated layout chains use `HX-Redirect` for a full
  load.

## [0.1.0]

### Added

- Initial MiniFW release for Bun-powered, server-rendered HTMX applications.
- Core factories: `mini`, `page`, `partial`, `layout`, and `fragment`.
- Helpers: `html`, `css`, `each`, `repeat`, `isHtmx`, `error`, `isMiniError`,
  and `MiniHttpError`.
