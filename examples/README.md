# E2E Examples

These small Bun applications are consumer-style testbeds for MiniFW's TypeScript
source package. Each imports `minifw/core` through the package exports, loads a
pinned local HTMX bundle, and has a Bun WebView test beside it.

| App      | HTMX version | Behavior covered                                   | Run manually              |
| -------- | ------------ | -------------------------------------------------- | ------------------------- |
| `htmx-1` | 1.9.12       | Partial routes and `hx-swap="outerHTML"`           | `bun run examples:htmx-1` |
| `htmx-2` | 2.0.4        | Boosted page navigation and scoped-style promotion | `bun run examples:htmx-2` |
| `htmx-4` | 4.0.0        | Explicitly inherited boosted navigation            | `bun run examples:htmx-4` |

Run all browser tests with `bun run e2e`. The command starts each app from its
TypeScript source and controls Chromium through Bun's built-in `Bun.WebView`
API. On Linux and Windows, install Chrome, Chromium, Edge, or Brave before
running the browser tests.

MiniFW defaults to HTMX 4.0.0. It sets `hx-boost:inherited="true"` alongside the
generated `hx-boost="true"` so boosted navigation continues to apply to
descendant links under HTMX 4 while remaining compatible with HTMX 1 and 2.
