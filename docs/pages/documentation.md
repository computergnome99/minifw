---
title: Documentation
---

# Documentation

This page is a working reference for the Markdown features available in the
MiniFW documentation site. It doubles as a visual fixture for the documentation
styles.

> [!TIP] Write at the speed of thought
>
> Keep page content in a neighboring `.md` file, then render it with the local
> `markdown()` helper. Frontmatter, callouts, and highlighted code fences are
> available without becoming part of the MiniFW package API.

> [!WARNING]
>
> This is a warning callout with its default label. CSS decides how known kinds
> are colored.

> [!Example] Custom kinds are welcome
>
> Any callout kind becomes a `.callout-<kind>` class, so a site can introduce
> its own vocabulary without changing the parser.

## Text Formatting

Use **strong text**, _emphasis_, **_both together_**, ~~strikethrough~~, and
`inline code`. Links can be [relative](/), [external](https://htmx.org/), or
automatic: <https://bun.sh>.

Escape Markdown punctuation when it is literal: \*not emphasis\*, \# not a
heading, and \`not code\`.

## Headings

### Third-Level Heading

#### Fourth-Level Heading

##### Fifth-Level Heading

###### Sixth-Level Heading

## Lists

- An unordered item
- Another item with `inline code`
  - A nested item
  - A second nested item
- A final item

1. An ordered step
2. Another step
   1. A nested step
   2. A second nested step
3. The final step

- [x] Render on the server
- [x] Enhance navigation with HTMX
- [ ] Add the next documentation page

## Quotes And Callouts

> A conventional blockquote is useful for cited material, brief asides, and
> notes that do not need a semantic callout kind.
>
> It can contain multiple paragraphs.

> [!NOTE] A labeled note
>
> Callout bodies support the same Markdown as the rest of the page, including
> **strong text**, links, and `code`.

> [!DANGER] Treat user input as untrusted
>
> Markdown is rendered into HTML. Do not pass untrusted content to the renderer
> without a sanitization policy appropriate for your application.

## Code

Inline `mini({ routes })` calls are useful in prose. Fenced blocks receive
syntax highlighting when their language is known.

```ts
import { mini, page } from "@calvinbonner/minifw/core";
import { html } from "@calvinbonner/minifw/helpers";

const server = mini({
  routes: {
    "/": page(() => html`<h1>Hello, MiniFW</h1>`),
  },
});

console.log(`Listening at ${server.url}`);
```

```css
.callout-example {
  --color: #7c3aed;
}
```

```text
Plain-text fences preserve whitespace
	and indentation.
```

## Tables

| Primitive    | Purpose                        | HTMX-aware |
| :----------- | :----------------------------- | ---------: |
| `page()`     | A route response               |        Yes |
| `partial()`  | A reusable fragment endpoint   |        Yes |
| `fragment()` | Reusable context-free markup   |         No |
| `layout()`   | The application document shell |        Yes |

## Media And HTML

![MiniFW logo](/assets/logo.svg)

<details>
	<summary>Raw HTML is preserved</summary>

    This disclosure element is written directly in Markdown and rendered as HTML.

</details>

---

[Return home](/)
