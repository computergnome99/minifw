---
title: Cache Management
order: 30
tags: [cache, performance, page, partial]
---

# Cache Management

MiniFW can cache rendered [page()](/docs/core/page) and
[partial()](/docs/core/partial) HTML in memory. Set `cache: true` to cache
indefinitely, or provide a millisecond time-to-live.

## Cache Options

```ts
const permanent = page(renderCatalog, { cache: true });
const catalog = page(renderCatalog, { cache: { ttl: 60_000 } });
const live = page(renderCatalog, { cache: false });
```

Omit `cache`, or set it to `false`, to render each request. A TTL must be a
positive number of milliseconds.

## Cache Keys

MiniFW uses different keys for pages and partials. A key includes the route or
partial name, URL pathname, query string, matched parameters, and HTMX state.
Different route parameters, query values, and HTMX/full-page requests are cached
separately.

## Lifetime And Limits

The cache is process-local memory. It is cleared when the server restarts, is
not shared between instances, and has no explicit maximum size or manual
invalidation API. Expired entries are removed when their key is requested again.

Cache only output that is safe to reuse for the full cache key. Avoid caching
per-user content unless the URL fully and safely distinguishes every response.
For highly dynamic data, omit caching and render fresh HTML.

Cached responses are already minified. See
[Minification](/docs/extra/minification) and [mini()](/docs/core/mini) for the
request pipeline.
