# E2E Examples

These small applications are consumer-style testbeds for MiniFW's TypeScript
source package. Each imports `@calvinbonner/minifw` through the package exports
and has a Bun WebView test beside it.

| App          | Server                  | Behavior covered                                   | Run manually             |
| ------------ | ----------------------- | -------------------------------------------------- | ------------------------ |
| `bun-routes` | `Bun.serve({ routes })` | Manual page and layout rendering with route params | `bun run run:bun-routes` |
| `express`    | Express on Node + `tsx` | Manual MiniFW page rendering                       | `bun run run:express`    |
| `htmx-1`     | Bun + HTMX 1.9.12       | Partial routes and `hx-swap="outerHTML"`           | `bun run run:htmx-1`     |
| `htmx-2`     | Bun + HTMX 2.0.4        | Boosted page navigation and scoped-style promotion | `bun run run:htmx-2`     |
| `htmx-4`     | Bun + HTMX 4.0.0        | Explicitly inherited boosted navigation            | `bun run run:htmx-4`     |

Run all browser tests with `bun run test:e2e`. The command starts each app from
its TypeScript source and controls Chromium through Bun's built-in `Bun.WebView`
API. On Linux and Windows, install Chrome, Chromium, Edge, or Brave before
running the browser tests. Each run writes initial and post-interaction PNGs to
the ignored `test-results/<app>/` directory.

MiniFW defaults to HTMX 4.0.0. It sets `hx-boost:inherited="true"` alongside the
generated `hx-boost="true"` so boosted navigation continues to apply to
descendant links under HTMX 4 while remaining compatible with HTMX 1 and 2.
