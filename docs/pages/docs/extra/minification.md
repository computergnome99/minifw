---
title: Minification
order: 32
tags: [minification, html, css, performance]
---

# Minification

MiniFW minifies rendered HTML before returning [page()](/docs/core/page) and
[partial()](/docs/core/partial) responses. It also minifies scoped and global
CSS, including inline style blocks.

## What Is Minified

- Page responses after layout composition or HTMX page rendering
- Partial responses
- Page and partial CSS from style functions
- Global CSS configured through [mini()](/docs/core/mini)
- Global scripts configured through [mini()](/docs/core/mini)

CSS is processed with Lightning CSS. HTML is processed after MiniFW has applied
layout and scoped-style behavior, so the client receives compact final output.

## Author Readable Source

No build configuration is required. Keep source markup and styles readable;
MiniFW optimizes the response sent to clients. CSS imports in global `Bun.file`
entries resolve during bundling before the final CSS is minified.

Minification changes response formatting, not the HTML or CSS source files in
your project. See [Style Encapsulation](/docs/extra/style-encapsulation) for how
scoped styles are prepared before response minification.
