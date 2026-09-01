---
title: repeat()
order: 26
tags: [repeat, iteration, rendering]
---

# `repeat()`

`repeat()` invokes a string-producing callback a fixed number of times and
concatenates the results. The callback receives a zero-based index.

## Fixed Repetition

```ts
import { repeat } from "@calvinbonner/minifw/helpers";

const stars = repeat(3, () => "*");
const rows = repeat(2, (index) => `<li>Row ${index + 1}</li>`);
```

`repeat(0, callback)` returns an empty string. The helper uses JavaScript's
`Array.from({ length: count })` behavior, so provide a non-negative integer for
predictable output.

Use [each()](/docs/helpers/each) for data you already have in an array. Both
helpers return ordinary strings that can be interpolated into
[html](/docs/helpers/html) in a [page()](/docs/core/page),
[partial()](/docs/core/partial), or [fragment()](/docs/core/fragment).
