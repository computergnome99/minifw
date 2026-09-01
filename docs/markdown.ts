import matter from "gray-matter";
import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import type { Tokens } from "marked";

type CalloutToken = Tokens.Generic & {
  raw: string;
  text: string;
  tokens: Tokens.Generic[];
  type: "callout";
  title: string;
  variant: string;
};

/** Render source code with Highlight.js syntax markup. */
export function highlightCode(code: string, language: string): string {
  if (!hljs.getLanguage(language)) return escapeHtml(code);

  return hljs.highlight(code, { language }).value;
}

export type MarkdownDocument = {
  attributes: Record<string, unknown>;
  html: string;
};

const markdownParser = new Marked(
  markedHighlight({
    highlight(code, language) {
      if (!language || !hljs.getLanguage(language)) {
        return hljs.highlightAuto(code).value;
      }

      return highlightCode(code, language);
    },
  }),
  {
    extensions: [
      {
        name: "callout",
        level: "block",
        tokenizer(source) {
          const match =
            /^>\s*\[!(?<variant>[^\]\s]+)\](?:[ \t]+(?<title>[^\n]*))?(?:\n|$)(?<content>(?:>[^\n]*(?:\n|$))*)/.exec(
              source,
            );
          if (!match?.groups) return;

          const { content, title, variant } = match.groups;
          if (!variant) return;

          const normalizedVariant = variant.toLowerCase();
          const label =
            title?.trim() ||
            `${normalizedVariant[0]?.toUpperCase()}${normalizedVariant.slice(1)}`;
          const calloutContent = content?.replaceAll(/^> ?/gm, "") ?? "";

          return {
            type: "callout",
            raw: match[0],
            text: calloutContent,
            // Marked binds the lexer to extension tokenizers.
            // eslint-disable-next-line unicorn/no-this-outside-of-class
            tokens: this.lexer.blockTokens(calloutContent) as Tokens.Generic[],
            title: label,
            variant: normalizedVariant,
          } satisfies CalloutToken;
        },
        childTokens: ["tokens"],
        renderer(token) {
          const callout = token as CalloutToken;
          // Marked binds the parser to extension renderers.
          // eslint-disable-next-line unicorn/no-this-outside-of-class
          return `<aside class="callout callout-${callout.variant}"><strong class="title">${callout.title}</strong>${this.parser.parse(callout.tokens)}</aside>`;
        },
      },
    ],
  },
);

function dedent(source: string): string {
  const lines = source.split("\n");
  while (lines[0]?.trim().length === 0) lines.shift();
  while (lines.at(-1)?.trim().length === 0) lines.pop();

  const indentation = Math.min(
    ...lines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0),
  );

  return lines.map((line) => line.slice(indentation)).join("\n");
}

function escapeHtml(value: string): string {
  return value.replaceAll(/[&<>"']/g, (character) => {
    return (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        character
      ] ?? character
    );
  });
}

/**
 * Parse Markdown frontmatter and render its body as HTML for the docs site.
 *
 * Supports GFM, fenced-code syntax highlighting, and Obsidian-style callouts:
 * `>[!NOTE] Optional label` followed by quoted Markdown content.
 *
 * @param source Markdown document source, optionally starting with YAML
 *   frontmatter.
 * @returns Parsed frontmatter attributes and rendered HTML.
 */
export function parseMarkdown(source: string): MarkdownDocument {
  const { content, data } = matter(dedent(source));

  return {
    attributes: data,
    html: markdownParser.parse(content, { async: false }),
  };
}

/**
 * Render a Markdown string as HTML for interpolation into a docs page.
 *
 * @param source Markdown source, optionally starting with YAML frontmatter.
 * @returns Rendered HTML.
 */
export function markdown(source: string): string {
  return parseMarkdown(source).html;
}
