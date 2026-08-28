import { minify as minifyMarkup } from "html-minifier-terser";
import { transform } from "lightningcss";

const styleTagPattern = /<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi;

/**
 * Minify a CSS string using Lightning CSS. Falls back to the original string if
 * parsing fails.
 */
export function minifyCss(input: string): string {
  if (input.trim() === "") {
    return "";
  }

  try {
    const { code } = transform({
      filename: "inline.css",
      code: Buffer.from(input),
      minify: true,
    });

    return Buffer.from(code).toString();
  } catch {
    return input;
  }
}

/** Minify all inline `<style>` blocks in an HTML string. */
function minifyInlineStyles(input: string): string {
  return input.replace(styleTagPattern, (_match, attributes, styleBody) => {
    const minifiedCss = minifyCss(styleBody ?? "");
    const styleAttributes = attributes ?? "";

    return `<style${styleAttributes}>${minifiedCss}</style>`;
  });
}

/** Minify an HTML string and minify inline style blocks with Lightning CSS. */
export async function minifyHtml(input: string): Promise<string> {
  const withMinifiedStyles = minifyInlineStyles(input);

  return minifyMarkup(withMinifiedStyles, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
  });
}

/** Shared minification helper for framework internals. */
export const minify = {
  html: minifyHtml,
  css: minifyCss,
};
