import { describe, expect, test } from "bun:test";
import { markdown, parseMarkdown } from "./markdown";

describe("docs markdown", () => {
  test("parses frontmatter separately from rendered HTML", () => {
    const result = parseMarkdown(`---
title: Getting started
draft: false
---
# Welcome`);

    expect(result.attributes).toEqual({
      title: "Getting started",
      draft: false,
    });
    expect(result.html).toContain("<h1>Welcome</h1>");
    expect(result.html).not.toContain("title: Getting started");
  });

  test("highlights fenced code blocks", () => {
    const result = markdown("```ts\nconst answer = 42;\n```");

    expect(result).toContain('class="language-ts"');
    expect(result).toContain('class="hljs-keyword"');
  });

  test("dedents Markdown template strings", () => {
    const result = markdown(`
      # Welcome

      A paragraph.
    `);

    expect(result).toContain("<h1>Welcome</h1>");
    expect(result).toContain("<p>A paragraph.</p>");
    expect(result).not.toContain("<pre><code>");
  });

  test("renders Obsidian-style Markdown callouts", () => {
    const result = markdown(`>[!WARNING]
>
> This is **important**.
> This is more of the callout.`);

    expect(result).toContain('<aside class="callout callout-warning">');
    expect(result).toContain('<strong class="title">Warning</strong>');
    expect(result).toContain("<p>This is <strong>important</strong>.");
    expect(result).toContain("This is more of the callout.");
  });

  test("uses a custom Obsidian callout label", () => {
    const result = markdown(`> [!Example] Fast Authoring
>
> Use Markdown directly in a page.`);

    expect(result).toBe(
      '<aside class="callout callout-example"><strong class="title">Fast Authoring</strong><p>Use Markdown directly in a page.</p>\n</aside>',
    );
  });
});
